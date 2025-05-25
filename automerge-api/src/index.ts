import { Repo } from "@automerge/automerge-repo";
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
		status: StatusCode.UpgradeRequired,
		webSocket: client,
	});
});

// eslint-disable-next-line import/no-default-export
export default app;
