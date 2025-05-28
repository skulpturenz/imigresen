import {
	ProtocolV1,
	type FromClientMessage,
	type FromServerMessage,
	type JoinMessage,
	type ProtocolVersion,
} from "@automerge/automerge-repo-network-websocket";
import {
	cbor as cborHelpers,
	NetworkAdapter,
	type PeerId,
	type PeerMetadata,
} from "@automerge/automerge-repo/slim";
import { invariant } from "es-toolkit";
import { HTTPException } from "hono/http-exception";

const { encode, decode } = cborHelpers;

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
	const { buffer, byteOffset, byteLength } = bytes;
	return buffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer;
};

// note: based on `WebSocketServerAdapter` from `@automerge/automerge-repo-network-websocket`
export class CfWebSocketNetworkAdapter extends NetworkAdapter {
	messages = [] as MessageEvent[];

	constructor(
		private client: WebSocket,
		private server: WebSocket,
		private keepAliveInterval = 5000,
	) {
		super();

		// note: normally this wouldn't be necessary and whats supposed to happen
		// is that the client sends a message when the connection opens, server replies
		// and everything is synced up
		// but: in local testing that initial message is sent before `connect` is called
		// so the server never receives it and sync does not work
		// we can't process this message right away because we also need a `peerId` which
		// is only available after the connection
		this.server.addEventListener("message", event => {
			this.messages.push(event);
		});
	}

	isReady() {
		return this.server.readyState === WebSocket.OPEN;
	}

	whenReady() {
		const INTERVAL_MS = 50;

		return new Promise<void>(resolve => {
			// no `open` event with cloudflare workers
			const interval = setInterval(() => {
				if (this.isReady()) {
					clearInterval(interval);

					resolve();
				}
			}, INTERVAL_MS);
		});
	}

	connect(peerId: PeerId, peerMetadata?: PeerMetadata): void {
		this.peerId = peerId;
		this.peerMetadata = peerMetadata;

		const keepAliveId = setInterval(() => {
			this.server.send(".");
		}, this.keepAliveInterval);

		this.server.addEventListener("close", () => {
			clearInterval(keepAliveId);

			this.client.close(1000, "disconnect");
			this.server.close(1000, "disconnect");
		});

		this.server.addEventListener("message", event => {
			this.#receiveMessage(event.data as ArrayBuffer);
		});

		const queuedMessages = [...this.messages];
		queuedMessages.forEach(event => {
			this.messages.shift();
			this.#receiveMessage(event.data as ArrayBuffer);
		});
	}

	disconnect(): void {
		this.emit("peer-disconnected", { peerId: this.peerId as PeerId });
		this.client.close(1000, "disconnect"); // TODO: check code
		this.server.close(1000, "disconnect");
	}

	send(message: FromServerMessage): void {
		invariant(
			"targetId" in message && message.targetId !== undefined,
			new HTTPException(500, { message: "targetId not specified" }),
		);
		invariant(
			!("data" in message && message.data?.byteLength === 0),
			new HTTPException(500, {
				message: "Tried to send a zero-length message",
			}),
		);

		const senderId = this.peerId;
		invariant(
			senderId,
			new HTTPException(500, {
				message:
					"no peerId set for the websocket server network adapter.",
			}),
		);

		if (this.server.readyState === WebSocket.CLOSED) {
			console.debug(
				`tried to send to disconnected client ${message.targetId}`,
			);

			return;
		}

		const encoded = encode(message);
		const arrayBuf = toArrayBuffer(encoded) as ArrayBuffer;

		this.server.send(arrayBuf);
	}

	#receiveMessage(messageBuffer: ArrayBuffer) {
		let message: FromClientMessage;
		try {
			message = decode(new Uint8Array(messageBuffer));
		} catch (error) {
			console.error("invalid message, closing connection", error);

			this.client.close();

			return;
		}

		const { type, senderId } = message;

		const myPeerId = this.peerId;
		invariant(
			myPeerId,
			new HTTPException(500, {
				message: `is peer ${this.peerId} connected?`,
			}),
		);

		const documentId =
			"documentId" in message ? "@" + message.documentId : "";
		const { byteLength } = messageBuffer;
		console.log(
			`[${senderId}->${myPeerId}${documentId}] ${type} | ${byteLength} bytes`,
		);

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
					message: "unsupported protocol version",
					targetId: senderId,
				});
				this.client.close();
			} else {
				this.send({
					type: "peer",
					senderId: this.peerId!,
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

const isJoinMessage = (message: FromClientMessage): message is JoinMessage =>
	message.type === "join";

const selectProtocol = (versions?: ProtocolVersion[]) => {
	if (versions === undefined) return ProtocolV1;
	if (versions.includes(ProtocolV1)) return ProtocolV1;
	return null;
};
