import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid()],
	resolve: {
		alias: {
			feat: "./src/feat",
			core: "./src/core",
			ui: "./src/ui",
		},
	},
});
