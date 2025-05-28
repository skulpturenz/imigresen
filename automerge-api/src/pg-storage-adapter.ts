import {
	type Chunk,
	type StorageAdapterInterface,
	type StorageKey,
} from "@automerge/automerge-repo";
import { env } from "cloudflare:workers";
import { invariant } from "es-toolkit";
import { HTTPException } from "hono/http-exception";
import type { Buffer } from "node:buffer";
import { default as postgres } from "postgres";
import { StatusCode } from "./enums";

interface AutomergeRow {
	key: string;
	data: Buffer;
}

interface AutomergeRepo {
	softRemoveRange: (keyPrefix: StorageKey) => Promise<void>;
}

invariant(env.PG_CONNECTION_STRING, 'env "PG_CONNECTION_STRING" not defined');
export const createPgClient = () => postgres(env.PG_CONNECTION_STRING);

export const warmupConnectionPool = (sql: postgres.Sql) => sql`SELECT 1;`;

export class PgStorageAdapter
	implements AutomergeRepo, StorageAdapterInterface
{
	constructor(private sql: postgres.Sql) {}

	async load(key: StorageKey): Promise<Uint8Array | undefined> {
		const result = (await this.sql`SELECT data
				FROM automerge 
				WHERE key = ${toDatabaseKey(key)} AND 
				deleted IS NOT TRUE`) as AutomergeRow[];

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug("loaded", toDatabaseKey(key), result);
		}

		if (!result.length) {
			return;
		}

		const row = result.at(0);
		invariant(
			row?.data,
			new HTTPException(StatusCode.InternalServerError, {
				message: `Unable to load "${toDatabaseKey(key)}"`,
			}),
		);

		return row.data;
	}

	async save(key: StorageKey, data: Uint8Array): Promise<void> {
		const result = await this.sql`INSERT INTO automerge(key, data) VALUES(
			${toDatabaseKey(key)}, ${data}
		)
			
		RETURNING *`;

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug("saved", toDatabaseKey(key), result);
		}

		invariant(
			result.length,
			new HTTPException(StatusCode.InternalServerError, {
				message: `No data for "${toDatabaseKey(key)}" inserted`,
			}),
		);
	}

	async remove(key: StorageKey): Promise<void> {
		const result = await this
			.sql`DELETE FROM automerge WHERE key = ${toDatabaseKey(key)}
			
			RETURNING *`;

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug("removed", toDatabaseKey(key), result);
		}

		invariant(
			result.length,
			new HTTPException(StatusCode.InternalServerError, {
				message: `"${toDatabaseKey(key)}" not removed`,
			}),
		);
	}

	async loadRange(keyPrefix: StorageKey): Promise<Chunk[]> {
		// quotation marks: https://github.com/porsager/postgres?tab=readme-ov-file#query-parameters
		const result = (await this.sql`SELECT key, data 
				FROM automerge 
				WHERE key LIKE ${toDatabaseKey(keyPrefix) + "%"} AND 
				deleted IS NOT TRUE`) as AutomergeRow[];

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug("loadRange", toDatabaseKey(keyPrefix), result);
		}

		if (!result.length) {
			return [];
		}

		return result.map(({ key, data }) => ({
			key: toAutomergeKey(key),
			data,
		}));
	}

	async removeRange(keyPrefix: StorageKey): Promise<void> {
		// quotation marks: https://github.com/porsager/postgres?tab=readme-ov-file#query-parameters
		const result = await this.sql`DELETE FROM automerge 
				WHERE key LIKE ${toDatabaseKey(keyPrefix) + "%"}
			
			RETURNING *`;

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug("removeRange", toDatabaseKey(keyPrefix), result);
		}

		invariant(
			result.length,
			new HTTPException(StatusCode.InternalServerError, {
				message: `"${toDatabaseKey(keyPrefix)}" not removed`,
			}),
		);
	}

	// if an automerge is removed by calling `delete` on the handle then
	// it should call `removeRange` but just in case we also soft delete
	// it so that we know what the stale records are
	async softRemoveRange(keyPrefix: StorageKey): Promise<void> {
		const result = await this.sql`UPDATE automerge
				SET deleted = TRUE
				WHERE key LIKE ${toDatabaseKey(keyPrefix) + "%"}
			
			RETURNING *`;

		if (env.WORKER_ENVIRONMENT !== "production") {
			console.debug("removed", toDatabaseKey(keyPrefix), result);
		}
	}
}

const toDatabaseKey = (key: StorageKey) => key.join(".");
const toAutomergeKey = (key: string) => key.split(".");
