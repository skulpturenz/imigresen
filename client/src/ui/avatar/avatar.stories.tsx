import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { AvatarFallback, AvatarImage, AvatarRoot } from "ui/avatar";

export default {
	title: "ui/avatar",
	parameters: {
		docs: {
			description: {
				component:
					"An image element with a fallback for representing the user",
			},
		},
	},
} satisfies Meta;

export const Default: Story = {
	render: () => (
		<AvatarRoot>
			<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
			<AvatarFallback>CN</AvatarFallback>
		</AvatarRoot>
	),
};
