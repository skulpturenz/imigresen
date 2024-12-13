import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Muted } from "ui/typography/muted";

export default {
	title: "ui/typography/muted",
	component: Muted,
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
