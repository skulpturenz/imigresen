import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Large } from "ui/typography/large";

export default {
	title: "ui/typography/large",
	component: Large,
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
