import { Repo } from "@automerge/automerge-repo";
import {
	initOidcAuthMiddleware,
	oidcAuthMiddleware,
	processOAuthCallback,
} from "@hono/oidc-auth";
import { env } from "cloudflare:workers";
import { invariant } from "es-toolkit";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { appendTrailingSlash } from "hono/trailing-slash";
import type { default as postgres } from "postgres";
import { CfWebSocketNetworkAdapter } from "./cf-websocket-network-adapter";
import { HttpHeaders, HttpMethod, StatusCode } from "./enums";
import {
	createPgClient,
	PgStorageAdapter,
	warmupConnectionPool,
} from "./pg-storage-adapter";

invariant(env.ALLOWED_ORIGINS, 'env "ALLOWED_ORIGINS" not defined');
const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS.split(",").map(origin =>
	origin.trim(),
);

interface Env {
	Variables: {
		pg: postgres.Sql;
	};
}

const api = new Hono<Env>()
	.use("*", oidcAuthMiddleware())
	.get("/", async c => {
		if (c.req.header(HttpHeaders.Upgrade) !== "websocket") {
			return new Response("Expected Upgrade: websocket", {
				status: StatusCode.UpgradeRequired,
			});
		}

		const pgClient = c.get("pg");
		const storageAdapter = new PgStorageAdapter(pgClient);

		const pair = new WebSocketPair();
		const client = pair[0];
		const server = pair[1];

		new Repo({
			storage: storageAdapter,
			network: [new CfWebSocketNetworkAdapter(client, server)],
			// server should only share what is asked for
			sharePolicy: async () => false,
		});

		server.accept();

		return new Response(null, {
			status: StatusCode.SwitchingProtocols,
			webSocket: client,
		});
	})
	.delete("/doc/:documentId", async c => {
		const AUTOMERGE_URL_PREFIX = "automerge:";

		const pgClient = c.get("pg");

		const { documentId } = c.req.param();

		invariant(
			documentId,
			new HTTPException(StatusCode.BadRequest, {
				message: "Automerge document ID not specified",
			}),
		);

		const storageAdapter = new PgStorageAdapter(pgClient);

		storageAdapter.softRemoveRange([
			documentId.replaceAll(AUTOMERGE_URL_PREFIX, ""),
		]);
	});

const OIDC_ENVS = {
	OIDC_AUTH_SECRET: env.OIDC_AUTH_SECRET,
	OIDC_REDIRECT_URI: env.OIDC_REDIRECT_URL,
	OIDC_ISSUER: env.OIDC_ISSUER,
	OIDC_CLIENT_ID: env.OIDC_CLIENT_ID,
	OIDC_CLIENT_SECRET: env.OIDC_CLIENT_SECRET,
};
Object.entries(OIDC_ENVS).forEach(([env, value]) =>
	invariant(value, `env "${env}" not defined`),
);

const app = new Hono()
	.use(logger())
	.use(secureHeaders())
	.use(timing())
	.use(appendTrailingSlash())
	.use("*", requestId())
	.use(
		cors({
			origin: origin =>
				ALLOWED_ORIGINS.find(allowedOrigin => allowedOrigin === origin),
			allowHeaders: [
				HttpHeaders.UpgradeInsecureRequests,
				HttpHeaders.Upgrade,
			],
			allowMethods: [HttpMethod.Get, HttpMethod.Options],
			credentials: false,
		}),
	)
	.use(initOidcAuthMiddleware(OIDC_ENVS))
	.use(
		createMiddleware(async (c, next) => {
			const pgClient = createPgClient();
			warmupConnectionPool(pgClient);

			c.set("pg", pgClient);

			next();
		}),
	)
	.get("/ping", c => c.text("."))
	.get("/callback", processOAuthCallback)
	.route("/api/v1", api);

// eslint-disable-next-line import/no-default-export
export default app;
