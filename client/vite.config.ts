import { join } from "node:path";
import { defineConfig } from "vite";
import { default as solid } from "vite-plugin-solid";
import { default as webfontDownload } from "vite-plugin-webfont-dl";

export default defineConfig({
	plugins: [solid(), webfontDownload()],
	resolve: {
		alias: {
			feat: join(__dirname, "./src/feat"),
			core: join(__dirname, "./src/core"),
			ui: join(__dirname, "./src/ui"),
		},
	},
});
