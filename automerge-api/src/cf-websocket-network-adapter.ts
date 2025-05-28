import {
	ProtocolV1,
	type FromClientMessage,
	type FromServerMessage,
	type JoinMessage,
	type ProtocolVersion,
} from "@automerge/automerge-repo-network-websocket";
import {
	cbor,
	NetworkAdapter,
	type PeerId,
	type PeerMetadata,
} from "@automerge/automerge-repo/slim";
import { invariant } from "es-toolkit";
import { HTTPException } from "hono/http-exception";
import { StatusCode } from "./enums";

enum AutomergeEvents {
	PeerDisconnected = "peer-disconnected",
	PeerCandidate = "peer-candidate",
	Message = "message",
}

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
			this.server.send(toArrayBuffer(cbor.encode(".")));
		}, this.keepAliveInterval);

		this.server.addEventListener("close", () => {
			clearInterval(keepAliveId);

			this.disconnect();
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
		this.emit(AutomergeEvents.PeerDisconnected, {
			peerId: this.peerId as PeerId,
		});
		this.client.close();
		this.server.close();
	}

	send(message: FromServerMessage): void {
		invariant(
			"targetId" in message && message.targetId !== undefined,
			new HTTPException(StatusCode.InternalServerError, {
				message: "targetId not specified",
			}),
		);
		invariant(
			!("data" in message && message.data?.byteLength === 0),
			new HTTPException(StatusCode.InternalServerError, {
				message: "Tried to send a zero-length message",
			}),
		);

		const senderId = this.peerId;
		invariant(
			senderId,
			new HTTPException(StatusCode.InternalServerError, {
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

		this.server.send(toArrayBuffer(cbor.encode(message)));
	}

	#receiveMessage(messageBuffer: ArrayBuffer) {
		const decodeMessage = (messageBuffer: ArrayBuffer) => {
			try {
				return cbor.decode<FromClientMessage>(
					new Uint8Array(messageBuffer),
				);
			} catch (error) {
				console.error("invalid message, closing connection", error);

				return null;
			}
		};

		const message = decodeMessage(messageBuffer);
		if (!message) {
			this.disconnect();

			return;
		}

		const serverPeerId = this.peerId;
		invariant(
			serverPeerId,
			new HTTPException(StatusCode.InternalServerError, {
				message: `is peer ${this.peerId} connected?`,
			}),
		);

		const documentId =
			"documentId" in message ? "@" + message.documentId : "";
		const { byteLength } = messageBuffer;
		console.log(
			`[${message.senderId}->${serverPeerId}${documentId}] ${message.type} | ${byteLength} bytes`,
		);

		if (!isJoinMessage(message)) {
			this.emit(AutomergeEvents.Message, message);

			return;
		}

		// Let the repo know that we have a new connection.
		this.emit(AutomergeEvents.PeerCandidate, {
			peerId: message.senderId,
			peerMetadata: message.peerMetadata,
		});

		const selectedProtocolVersion = selectProtocol(
			message.supportedProtocolVersions,
		);

		invariant(
			this.peerId,
			new HTTPException(StatusCode.InternalServerError, {
				message: "client does not have a peer id",
			}),
		);

		if (selectedProtocolVersion === null) {
			this.send({
				type: "error",
				senderId: this.peerId,
				message: "unsupported protocol version",
				targetId: message.senderId,
			});
			this.client.close();

			return;
		}

		this.send({
			type: "peer",
			senderId: this.peerId,
			peerMetadata: this.peerMetadata!,
			selectedProtocolVersion: ProtocolV1,
			targetId: message.senderId,
		});
	}
}

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
	const { buffer, byteOffset, byteLength } = bytes;
	return buffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer;
};

const isJoinMessage = (message: FromClientMessage): message is JoinMessage =>
	message.type === "join";

const selectProtocol = (versions?: ProtocolVersion[]) => {
	if (versions === undefined) return ProtocolV1;
	if (versions.includes(ProtocolV1)) return ProtocolV1;
	return null;
};
