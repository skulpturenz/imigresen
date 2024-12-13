import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { P } from "ui/typography/p";

export default {
	title: "ui/typography/p",
	component: P,
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
