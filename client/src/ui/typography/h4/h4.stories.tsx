import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { H4 } from "ui/typography/h4";

export default {
	title: "ui/typography/h4",
	component: H4,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta;

export const Default: Story = {
	args: {
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};
