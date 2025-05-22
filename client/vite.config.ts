import { default as tailwindcss } from "@tailwindcss/vite";
import { join } from "node:path";
import { defineConfig } from "vite";
import { default as viteCompression } from "vite-plugin-compression";
import { default as solid } from "vite-plugin-solid";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import { default as webfontDownload } from "vite-plugin-webfont-dl";

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
