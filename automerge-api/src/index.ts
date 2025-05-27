import { Repo } from "@automerge/automerge-repo";
import {
	initOidcAuthMiddleware,
	oidcAuthMiddleware,
	processOAuthCallback,
} from "@hono/oidc-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { appendTrailingSlash } from "hono/trailing-slash";
import { CfWebSocketNetworkAdapter } from "./cf-websocket-network-adapter";
import { storageAdapter } from "./pg-storage-adapter";

enum StatusCode {
	UpgradeRequired = 426,
	SwitchingProtocols = 101,
}

enum HttpMethod {
	Get = "GET",
	Options = "OPTIONS",
}

enum HttpHeaders {
	UpgradeInsecureRequests = "Upgrade-Insecure-Requests",
	Upgrade = "Upgrade",
}

const app = new Hono<{ Bindings: CloudflareBindings }>();
app.use(
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
);
app.use(
	initOidcAuthMiddleware({
		OIDC_AUTH_SECRET: "", // TODO
		OIDC_REDIRECT_URI: "", // TODO
		OIDC_ISSUER: "", // TODO
		OIDC_CLIENT_ID: "", // TODO
		OIDC_CLIENT_SECRET: "", // TODO
	}),
);

app.use(logger());
app.use(secureHeaders());
app.use(timing());
app.use(appendTrailingSlash());
app.use("*", requestId());

app.get("/ping", c => c.text("."));

app.get("/callback", processOAuthCallback);
app.use("*", oidcAuthMiddleware());

app.get("/", async c => {
	if (c.req.header(HttpHeaders.Upgrade) !== "websocket") {
		return new Response("Expected Upgrade: websocket", {
			status: StatusCode.UpgradeRequired,
		});
	}

	const pair = new WebSocketPair();
	const [client, server] = Object.values(pair);

	server.accept?.();

	new Repo({
		storage: storageAdapter,
		network: [new CfWebSocketNetworkAdapter(client, server)],
	});

	return new Response(null, {
		status: StatusCode.SwitchingProtocols,
		webSocket: client,
	});
});

// eslint-disable-next-line import/no-default-export
export default app;
