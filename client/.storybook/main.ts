import type { StorybookConfig } from "storybook-solidjs-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [
		"@storybook/addon-essentials",
		"@chromatic-com/storybook",
		"@storybook/addon-interactions",
	],
	framework: {
		name: "storybook-solidjs-vite",
		options: {},
	},
	viteFinal: config =>
		mergeConfig(config, {
			mode: "storybook",
		}),
};
export default config;
