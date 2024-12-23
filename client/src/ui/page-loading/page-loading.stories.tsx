import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { PageLoading } from "ui/page-loading";

export default {
	title: "ui/page-loading",
	parameters: {
		docs: {
			description: {
				component:
					"Displays an indeterminate loader, typically used when a page is loading",
			},
		},
		toggleTheme: false,
	},
} satisfies Meta<typeof PageLoading>;

export const Default: Story<typeof PageLoading> = {
	render: () => <PageLoading />,
};
