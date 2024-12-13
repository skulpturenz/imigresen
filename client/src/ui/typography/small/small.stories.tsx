import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Small } from "ui/typography/small";

export default {
	title: "ui/typography/small",
	component: Small,
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
