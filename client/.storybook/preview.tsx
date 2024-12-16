/** @jsxImportSource solid-js */

import type { Preview } from "storybook-solidjs";
import "../src/core/assets/tailwind.css";
import "../src/core/assets/theme.css";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
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
