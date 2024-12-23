import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Avatar, AvatarFallback, AvatarImage } from "ui/avatar";

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
} satisfies Meta<typeof Avatar>;

export const Default: Story<typeof Avatar> = {
	render: () => (
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
			<AvatarFallback>CN</AvatarFallback>
		</Avatar>
	),
};
