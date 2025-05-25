import {
	type Chunk,
	type StorageAdapterInterface,
	type StorageKey,
} from "@automerge/automerge-repo";
import { env } from "cloudflare:workers";
import { invariant } from "es-toolkit";
// eslint-disable-next-line import/no-nodejs-modules
import { Buffer } from "node:buffer"; // TODO
import { default as postgres } from "postgres";

interface AutomergeRow {
	key: string;
	data: string;
}

invariant(env.PG_CONNECTION_STRING, "Postgres connection string not defined");
const pgClient = postgres(env.PG_CONNECTION_STRING);

export class PgStorageAdapter implements StorageAdapterInterface {
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

export const storageAdapter = new PgStorageAdapter(pgClient);
