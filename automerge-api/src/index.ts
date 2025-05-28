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
		const pgClient = c.get("pg");

		const { documentId } = c.req.param();

		invariant(
			documentId,
			new HTTPException(StatusCode.BadRequest, {
				message: "Automerge document ID not specified",
			}),
		);

		const storageAdapter = new PgStorageAdapter(pgClient);

		storageAdapter.softRemoveRange([documentId]);
	});

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
	.use(
		initOidcAuthMiddleware({
			OIDC_AUTH_SECRET: "", // TODO
			OIDC_REDIRECT_URI: "", // TODO
			OIDC_ISSUER: "", // TODO
			OIDC_CLIENT_ID: "", // TODO
			OIDC_CLIENT_SECRET: "", // TODO
		}),
	)
	.use(
		createMiddleware<Env>(async (c, next) => {
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
