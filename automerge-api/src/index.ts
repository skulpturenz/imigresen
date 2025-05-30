import { Repo } from "@automerge/automerge-repo";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { env } from "cloudflare:workers";
import { invariant } from "es-toolkit";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { jwk } from "hono/jwk";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { trimTrailingSlash } from "hono/trailing-slash";
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
	// .use("*", oidcAuthMiddleware())
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

interface AppEnv {
	Variables: {
		rateLimit: boolean;
	};
	Bindings: {
		AUTOMERGE_RATE_LIMIT: RateLimit;
	};
}

invariant(env.AUTHNZ_JWK_URL, "JWK url not specified");

const app = new Hono<AppEnv>()
	.use(
		cloudflareRateLimiter<AppEnv>({
			rateLimitBinding: c => c.env.AUTOMERGE_RATE_LIMIT,
			keyGenerator: c => c.req.query("cf-connecting-ip"),
		}),
	)
	.use(logger())
	.use(secureHeaders())
	.use(timing())
	.use(trimTrailingSlash())
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
	.get("/ping", c => c.text("."))
	.use(
		"*",
		jwk({
			jwks_uri: env.AUTHNZ_JWK_URL,
			cookie: "IMIGRESEN_AUTH_COOKIE",
		}),
	)
	.use(
		createMiddleware(async (c, next) => {
			console.log(getCookie(c, "IMIGRESEN_AUTH_COOKIE"));
			const pgClient = createPgClient();
			warmupConnectionPool(pgClient);

			c.set("pg", pgClient);

			await next();
		}),
	)
	.route("/api/v1", api);

// eslint-disable-next-line import/no-default-export
export default app;
