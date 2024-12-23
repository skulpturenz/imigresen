import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Loading } from "ui/loading";

export default {
	title: "ui/loading",
	parameters: {
		docs: {
			description: {
				component:
					"Displays an indeterminate loader, typically used when a page is loading",
			},
		},
		toggleTheme: false,
	},
} satisfies Meta<typeof Loading>;

export const Default: Story<typeof Loading> = {
	render: () => <Loading />,
};
