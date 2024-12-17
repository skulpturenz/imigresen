/** @jsxImportSource solid-js */

import type { Preview } from "storybook-solidjs";
import "../src/core/assets/tailwind.css";
import "../src/core/assets/theme.css";
import { theme } from "./theme";

const preview: Preview = {
	parameters: {
		docs: {
			theme,
		},
		controls: {
			matchers: {
				date: /Date$/i,
			},
		},
		layout: "centered",
	},
	decorators: [
		Story => (
			<>
				<Story />
			</>
		),
	],
};

export default preview;
