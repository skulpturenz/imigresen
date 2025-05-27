import {
	NetworkAdapter,
	type Message,
	type PeerId,
	type PeerMetadata,
} from "@automerge/automerge-repo";
// eslint-disable-next-line import/no-nodejs-modules
import { Buffer } from "node:buffer"; // TODO

import {
	ProtocolV1,
	type FromClientMessage,
	type JoinMessage,
	type ProtocolVersion,
} from "@automerge/automerge-repo-network-websocket";
import { Encoder, decode as cborXdecode } from "cbor-x";
import { invariant } from "es-toolkit";

function encode(obj: unknown): Buffer {
	const encoder = new Encoder({ tagUint8Array: false, useRecords: false });
	return encoder.encode(obj);
}

function decode<T = unknown>(buf: Buffer | Uint8Array): T {
	return cborXdecode(buf);
}

const toArrayBuffer = (bytes: Uint8Array) => {
	const { buffer, byteOffset, byteLength } = bytes;
	return buffer.slice(byteOffset, byteOffset + byteLength);
};

// note: based on `WebSocketServerAdapter` from `@automerge/automerge-repo-network-websocket`
export class CfWebSocketNetworkAdapter extends NetworkAdapter {
	constructor(
		private client: WebSocket,
		private server: WebSocket,
		private keepAliveInterval = 5000,
	) {
		super();
	}

	isReady() {
		return this.server.readyState === WebSocket.OPEN;
	}

	whenReady() {
		return new Promise<void>(resolve => {
			this.server.addEventListener("open", () => resolve());
		});
	}

	connect(peerId: PeerId, peerMetadata?: PeerMetadata): void {
		this.peerId = peerId;
		this.peerMetadata = peerMetadata;

		const keepAliveId = setInterval(() => {
			this.client.send(".");
		}, this.keepAliveInterval);

		this.server.addEventListener("close", () => {
			clearInterval(keepAliveId);

			this.client.close(1000, "disconnect");
			this.server.close(1000, "disconnect");
		});

		this.server.addEventListener("message", event => {
			this.#receiveMessage(event.data as ArrayBuffer);
		});
	}

	disconnect(): void {
		this.client.close(1000, "disconnect"); // TODO: check code
		this.server.close(1000, "disconnect");
	}

	send(message: Message): void {
		invariant(
			"targetId" in message && message.targetId !== undefined,
			"targetId not specified",
		);
		invariant(
			!message.data ||
				(message.data && Number(message.data?.byteLength) > 0),
			"tried to send a zero-length message",
		);

		const senderId = this.peerId;
		invariant(
			senderId,
			"no peerId set for the websocket server network adapter.",
		);

		if (this.client.readyState === WebSocket.CLOSED) {
			console.debug(
				`tried to send to disconnected client ${message.targetId}`,
			);

			return;
		}

		const encoded = encode(message);
		const arrayBuf = toArrayBuffer(encoded) as ArrayBuffer;

		this.client.send(arrayBuf);
	}

	#receiveMessage(messageBuffer: ArrayBuffer) {
		let message: FromClientMessage;
		try {
			message = decode(Buffer.from(messageBuffer));
		} catch (_e) {
			console.error("invalid message, closing connection");

			this.client.close();

			return;
		}

		const { type, senderId } = message;

		const myPeerId = this.peerId;
		invariant(myPeerId, `is peer ${this.peerId} connected?`);

		const documentId =
			"documentId" in message ? "@" + message.documentId : "";
		const { byteLength } = messageBuffer;
		console.log(
			`[${senderId}->${myPeerId}${documentId}] ${type} | ${byteLength} bytes`,
		);

		const isJoinMessage = (
			message: FromClientMessage,
		): message is JoinMessage => message.type === "join";

		const selectProtocol = (versions?: ProtocolVersion[]) => {
			if (versions === undefined) return ProtocolV1;
			if (versions.includes(ProtocolV1)) return ProtocolV1;
			return null;
		};

		if (isJoinMessage(message)) {
			const { peerMetadata, supportedProtocolVersions } = message;

			// Let the repo know that we have a new connection.
			this.emit("peer-candidate", { peerId: senderId, peerMetadata });

			const selectedProtocolVersion = selectProtocol(
				supportedProtocolVersions,
			);
			if (selectedProtocolVersion === null) {
				this.send({
					type: "error",
					senderId: this.peerId!,
					/// @ts-expect-error TODO
					message: "unsupported protocol version",
					targetId: senderId,
				});
				this.client.close();
			} else {
				this.send({
					type: "peer",
					senderId: this.peerId!,
					/// @ts-expect-error TODO
					peerMetadata: this.peerMetadata!,
					selectedProtocolVersion: ProtocolV1,
					targetId: senderId,
				});
			}
		} else {
			this.emit("message", message);
		}
	}
}
