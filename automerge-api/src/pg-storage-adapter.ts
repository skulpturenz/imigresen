import {
	type Chunk,
	type StorageAdapterInterface,
	type StorageKey,
} from "@automerge/automerge-repo";
import { env } from "cloudflare:workers";
import { invariant } from "es-toolkit";
import { HTTPException } from "hono/http-exception";
import { Buffer } from "node:buffer";
import { default as postgres } from "postgres";

interface AutomergeRow {
	key: string;
	data: string;
}

invariant(env.PG_CONNECTION_STRING, "Postgres connection string not defined");
export const createPgClient = () => postgres(env.PG_CONNECTION_STRING);

export const warmupConnectionPool = (sql: postgres.Sql) => sql`SELECT 1;`;

const serializeStorageKey = (key: StorageKey) => key.join(".");

export class PgStorageAdapter implements StorageAdapterInterface {
	constructor(private sql: postgres.Sql) {}

	async load(key: StorageKey): Promise<Uint8Array | undefined> {
		const result = (await this
			.sql`SELECT data FROM automerge WHERE key = ${serializeStorageKey(key)}`) as AutomergeRow[];

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug("loaded", serializeStorageKey(key), result);
		}

		if (!result.length) {
			return;
		}

		const row = result.at(0);
		invariant(
			row?.data,
			new HTTPException(500, {
				message: `Unable to load "${serializeStorageKey(key)}"`,
			}),
		);

		return Buffer.from(row.data);
	}

	async save(key: StorageKey, data: Uint8Array): Promise<void> {
		const result = await this.sql`INSERT INTO automerge(key, data) VALUES(
			${serializeStorageKey(key)}, ${Buffer.from(data).toString()}
		)
			
		RETURNING *`;

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug("saved", serializeStorageKey(key), result);
		}

		invariant(
			result.length,
			new HTTPException(500, {
				message: `No data for "${serializeStorageKey(key)}" inserted`,
			}),
		);
	}

	async remove(key: StorageKey): Promise<void> {
		const result = await this
			.sql`DELETE FROM automerge WHERE key = ${serializeStorageKey(key)}
			
			RETURNING *`;

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug("removed", serializeStorageKey(key), result);
		}

		invariant(
			result.length,
			new HTTPException(500, {
				message: `"${serializeStorageKey(key)}" not removed`,
			}),
		);
	}

	async loadRange(keyPrefix: StorageKey): Promise<Chunk[]> {
		// quotation marks: https://github.com/porsager/postgres?tab=readme-ov-file#query-parameters
		const result = (await this
			.sql`SELECT key, data FROM automerge WHERE key LIKE ${serializeStorageKey(keyPrefix) + "%"}`) as AutomergeRow[];

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug("loadRange", serializeStorageKey(keyPrefix), result);
		}

		if (!result.length) {
			return [];
		}

		return result.map(({ key, data }) => ({
			key: key.split("."),
			data: Buffer.from(data),
		}));
	}

	async removeRange(keyPrefix: StorageKey): Promise<void> {
		// quotation marks: https://github.com/porsager/postgres?tab=readme-ov-file#query-parameters
		const result = await this
			.sql`DELETE FROM automerge WHERE key LIKE ${serializeStorageKey(keyPrefix) + "%"}
			
			RETURNING *`;

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug(
				"removeRange",
				serializeStorageKey(keyPrefix),
				result,
			);
		}

		invariant(
			result.length,
			new HTTPException(500, {
				message: `"${serializeStorageKey(keyPrefix)}" not removed`,
			}),
		);
	}
}
