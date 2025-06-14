import { Repo } from "@automerge/automerge-repo";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
/* eslint-disable-next-line */
import * as Sentry from "@sentry/cloudflare";
import { env } from "cloudflare:workers";
import { createConsola } from "consola";
import { invariant } from "es-toolkit";
import { Hono } from "hono";
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
import { ParseableReporter } from "./parseable-reporter";
import {
	createPgClient,
	PgStorageAdapter,
	warmupConnectionPool,
} from "./pg-storage-adapter";

const consola = createConsola();
consola.wrapAll();

invariant(env.ALLOWED_ORIGINS, 'env "ALLOWED_ORIGINS" not defined');
const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS.split(",").map(origin =>
	origin.trim(),
);

interface ApiEnv {
	Variables: {
		pg: postgres.Sql;
		parseableReporter: ParseableReporter;
	};
}

const api = new Hono<ApiEnv>()
	.get("/", async c => {
		const parseableReporter = c.get("parseableReporter");

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
		server.addEventListener("close", parseableReporter.close);

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
		jwtPayload: any;
	};
	Bindings: {
		AUTOMERGE_RATE_LIMIT: RateLimit;
		CF_VERSION_METADATA: WorkerVersionMetadata;
	};
}

invariant(env.AUTHNZ_JWK_URL, "JWK url not specified");

const app = new Hono<AppEnv>()
	.onError((err, c) => {
		// Report _all_ unhandled errors.
		Sentry.captureException(err);
		if (err instanceof HTTPException) {
			return err.getResponse();
		}

		return c.json({ error: "Internal server error" }, 500);
	})
	.get("/ping", c => c.text("."))
	.use(
		"*",
		jwk({
			jwks_uri: env.AUTHNZ_JWK_URL,
			cookie: "IMIGRESEN_AUTH_COOKIE",
		}),
	)
	.use(
		createMiddleware((c, next) => {
			Sentry.setUser({
				id: c.get("jwtPayload").sub,
			});

			const parseableReporter = new ParseableReporter(
				env.OTEL_EXPORTER_OTLP_ENDPOINT,
				env.OTEL_EXPORTER_OTLP_AUTH_TOKEN,
				"imigresen",
			);

			consola.addReporter(parseableReporter);

			c.set("parseableReporter", parseableReporter);

			return next();
		}),
	)
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
		cloudflareRateLimiter<AppEnv>({
			rateLimitBinding: c => c.env.AUTOMERGE_RATE_LIMIT,
			keyGenerator: c => c.get("jwtPayload").sub,
		}),
	)
	.use(logger())
	.use(secureHeaders())
	.use(timing())
	.use(trimTrailingSlash())
	.use("*", requestId())
	.use(
		createMiddleware(async (c, next) => {
			const pgClient = createPgClient();
			warmupConnectionPool(pgClient);

			c.set("pg", pgClient);

			await next();
		}),
	)
	// want the routes to run then flush
	// see: https://hono.dev/docs/guides/middleware#execution-order
	.use(
		createMiddleware(async (c, next) => {
			await next();

			const parseableReporter: ParseableReporter =
				c.get("parseableReporter");

			parseableReporter.close();
			consola.removeReporter(parseableReporter);
		}),
	)
	.route("/api/v1", api);

// Sentry setup: https://docs.sentry.io/platforms/javascript/guides/cloudflare/frameworks/hono/
// eslint-disable-next-line import/no-default-export
export default Sentry.withSentry(env => {
	invariant(env, "Misconfiguration");

	const versionMetadata = (env as AppEnv["Bindings"]).CF_VERSION_METADATA;

	invariant(versionMetadata, "Misconfiguration");

	return {
		dsn: "https://141811b132a84088aa15384e72d5156a@triage.skulpture.xyz/1",
		release: versionMetadata.id,
		sendDefaultPii: true,
		// Enable logs to be sent to Sentry
		_experiments: { enableLogs: true },
		tracesSampleRate: 0.5,
	};
}, app);
