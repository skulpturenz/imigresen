import {
	NetworkAdapter,
	Repo,
	type Chunk,
	type Message,
	type PeerId,
	type PeerMetadata,
	type StorageAdapterInterface,
	type StorageKey,
} from "@automerge/automerge-repo";
import { env } from "cloudflare:workers";
import { invariant } from "es-toolkit";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { appendTrailingSlash } from "hono/trailing-slash";
// eslint-disable-next-line import/no-nodejs-modules
import { Buffer } from "node:buffer"; // TODO
import { default as postgres } from "postgres";

import {
	ProtocolV1,
	type FromClientMessage,
	type JoinMessage,
	type ProtocolVersion,
} from "@automerge/automerge-repo-network-websocket";
import { Encoder, decode as cborXdecode } from "cbor-x";

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

interface AutomergeRow {
	key: string;
	data: string;
}

invariant(env.PG_CONNECTION_STRING, "Postgres connection string not defined");
const pgClient = postgres(env.PG_CONNECTION_STRING);

class PgStorageAdapter implements StorageAdapterInterface {
	#sql: postgres.Sql;

	constructor(pg: postgres.Sql) {
		this.#sql = pg;
	}

	async load(key: StorageKey): Promise<Uint8Array | undefined> {
		const result = (await this
			.#sql`SELECT data FROM automerge WHERE key = ${key}`) as AutomergeRow[];

		const row = result.at(0);
		invariant(row?.data, `Unable to load "${key}"`);

		return Buffer.from(row.data);
	}

	async save(key: StorageKey, data: Uint8Array): Promise<void> {
		const result = await this.#sql`INSERT INTO automerge(key, data) VALUES(
			${key.join(".")}, ${Buffer.from(data).toString()}
		)
			
		RETURNING *`;

		invariant(result.length, `No data for "${key}" inserted`);
	}

	async remove(key: StorageKey): Promise<void> {
		const result = await this.#sql`DELETE FROM automerge WHERE key = ${key}
			
			RETURNING *`;

		invariant(result.length, `"${key}" not removed`);
	}

	async loadRange(keyPrefix: StorageKey): Promise<Chunk[]> {
		const result = (await this
			.#sql`SELECT key, data FROM automerge WHERE key LIKE ${keyPrefix.join(".")}`) as AutomergeRow[];

		return result.map(({ key, data }) => ({
			key: key.split("."),
			data: Buffer.from(data),
		}));
	}

	async removeRange(keyPrefix: StorageKey): Promise<void> {
		const result = await this
			.#sql`DELETE FROM automerge WHERE key LIKE ${keyPrefix.join(".")}
			
			RETURNING *`;

		invariant(result.length, `"${keyPrefix.join(".")}" not removed`);
	}
}
const storageAdapter = new PgStorageAdapter(pgClient);

// note: based on `WebSocketServerAdapter` from `@automerge/automerge-repo-network-websocket`
class CfWebSocketNetworkAdapter extends NetworkAdapter {
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
			"data" in message && message.data?.byteLength === 0,
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

const app = new Hono();

app.use(cors());
app.use(logger());
app.use("*", requestId());
app.use(secureHeaders());
app.use(timing());
app.use(appendTrailingSlash());

app.get("/ping", c => c.text("."));

app.get("/", async c => {
	if (c.req.header("Upgrade") !== "websocket") {
		return new Response("Expected Upgrade: websocket", { status: 426 });
	}

	const pair = new WebSocketPair();
	const [client, server] = Object.values(pair);

	server.accept?.();

	new Repo({
		storage: storageAdapter,
		network: [new CfWebSocketNetworkAdapter(client, server)],
	});

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
});

// eslint-disable-next-line import/no-default-export
export default app;
