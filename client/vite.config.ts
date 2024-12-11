import { join } from "node:path";
import { defineConfig } from "vite";
import { default as viteCompression } from "vite-plugin-compression";
import { default as solid } from "vite-plugin-solid";
import { default as webfontDownload } from "vite-plugin-webfont-dl";

export default defineConfig({
	plugins: [
		solid(),
		webfontDownload(),
		viteCompression({
			verbose: true,
			algorithm: "brotliCompress",
		}),
	],
	resolve: {
		alias: {
			feat: join(__dirname, "./src/feat"),
			core: join(__dirname, "./src/core"),
			ui: join(__dirname, "./src/ui"),
		},
	},
});
