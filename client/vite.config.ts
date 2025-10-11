/// <reference types="vitest" />
/// <reference types="vite/client" />

import { Repo } from "@automerge/automerge-repo";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";
import { default as tailwindcss } from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import { default as viteCompression } from "vite-plugin-compression";
import { default as eslint } from "vite-plugin-eslint2";
import { default as solid } from "vite-plugin-solid";
import { default as topLevelAwait } from "vite-plugin-top-level-await";
import { default as wasm } from "vite-plugin-wasm";
import { default as webfontDownload } from "vite-plugin-webfont-dl";
import { default as tsconfigPaths } from "vite-tsconfig-paths";
import { WebSocketServer } from "ws";

/* eslint-disable-next-line */
export default defineConfig(({ mode: _mode }) => {
	const reporters = ["verbose"];
	if (process.env.GITHUB_ACTIONS) {
		reporters.push("github-actions");
	}

	return {
		plugins: [
			tsconfigPaths(),
			eslint({
				cache: true,
				fix: false,
				dev: false,
				build: true,
				lintInWorker: false,
				lintDirtyOnly: true,
				emitWarningAsError: true,
			}),
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
				"feat/": new URL("./src/feat", import.meta.url).pathname,
				"core/": new URL("./src/core", import.meta.url).pathname,
				"ui/": new URL("./src/ui", import.meta.url).pathname,
				"common/": new URL("./src/common", import.meta.url).pathname,
			},
		},
		build: {
			sourcemap: true,
		},
		test: {
			silent: "passed-only",
			printConsoleTrace: true,
			mockReset: true,
			reporters,
			sequence: {
				concurrent: true,
			},
		},
	};
});

const automergeWsServer = (): Plugin => ({
	name: "configure-automerge-ws-server",
	apply(_config, env) {
		return env.mode === "development" && env.command === "serve";
	},
	configureServer(server) {
		const wss = new WebSocketServer({ noServer: true });

		const storage = new NodeFSStorageAdapter(
			new URL("./.automerge", import.meta.url).pathname,
		);

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
