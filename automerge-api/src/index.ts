import { Repo } from "@automerge/automerge-repo";
import {
	initOidcAuthMiddleware,
	oidcAuthMiddleware,
	processOAuthCallback,
} from "@hono/oidc-auth";
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
import { CfWebSocketNetworkAdapter } from "./cf-websocket-network-adapter";
import {
	createPgClient,
	PgStorageAdapter,
	warmupConnectionPool,
} from "./pg-storage-adapter";

enum StatusCode {
	UpgradeRequired = 426,
	SwitchingProtocols = 101,
	BadRequest = 400,
}

enum HttpMethod {
	Get = "GET",
	Options = "OPTIONS",
}

enum HttpHeaders {
	UpgradeInsecureRequests = "Upgrade-Insecure-Requests",
	Upgrade = "Upgrade",
}

const api = new Hono()
	.use("*", oidcAuthMiddleware())
	.get("/", async c => {
		if (c.req.header(HttpHeaders.Upgrade) !== "websocket") {
			return new Response("Expected Upgrade: websocket", {
				status: StatusCode.UpgradeRequired,
			});
		}

		/// @ts-expect-error: TODO
		const pgClient = c.get("pg");
		/// @ts-expect-error: TODO
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
		/// @ts-expect-error: TODO
		const pgClient = c.get("pg");

		const { documentId } = c.req.param();

		invariant(
			documentId,
			new HTTPException(StatusCode.BadRequest, {
				message: "Automerge document ID not specified",
			}),
		);

		/// @ts-expect-error: TODO
		const storageAdapter = new PgStorageAdapter(pgClient);

		storageAdapter.softRemoveRange([documentId]);
	});

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.use(logger())
	.use(secureHeaders())
	.use(timing())
	.use(appendTrailingSlash())
	.use("*", requestId())
	.use(
		cors({
			origin: origin => {
				return origin; // TODO
			},
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
