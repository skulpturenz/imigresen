import "../src/core/assets/tailwind.css";
import "../src/core/assets/theme.css";

/// @ts-ignore: TODO: type error
const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;
