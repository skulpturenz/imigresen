import { Repo } from "@automerge/automerge-repo";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";
import { default as tailwindcss } from "@tailwindcss/vite";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { default as viteCompression } from "vite-plugin-compression";
import { default as solid } from "vite-plugin-solid";
import { default as topLevelAwait } from "vite-plugin-top-level-await";
import { default as wasm } from "vite-plugin-wasm";
import { default as webfontDownload } from "vite-plugin-webfont-dl";
import { WebSocketServer } from "ws";

const automergeWsServer = (): Plugin => ({
	name: "configure-automerge-ws-server",
	configureServer(server) {
		const wss = new WebSocketServer({ noServer: true });

		const storage = new NodeFSStorageAdapter(join(__dirname, ".automerge"));

		new Repo({
			storage,
			network: [new NodeWSServerAdapter(wss as any)],
		});

		server.httpServer?.on("upgrade", (request, socket, head) => {
			// https://github.com/vitejs/vite/discussions/14182#discussioncomment-6831085
			if (
				(request.headers["sec-websocket-protocol"] as string)?.includes(
					"vite",
				)
			) {
				return;
			}

			wss.handleUpgrade(request, socket, head, socket => {
				wss.emit("connection", socket, request);
			});
		});
	},
});

export default defineConfig({
	plugins: [
		solid(),
		webfontDownload(),
		viteCompression({
			verbose: true,
			algorithm: "brotliCompress",
		}),
		tailwindcss(),
		wasm(),
		topLevelAwait(),
		automergeWsServer(),
	],
	resolve: {
		alias: {
			feat: join(__dirname, "./src/feat"),
			core: join(__dirname, "./src/core"),
			ui: join(__dirname, "./src/ui"),
		},
	},
	build: {
		sourcemap: true,
	},
});
