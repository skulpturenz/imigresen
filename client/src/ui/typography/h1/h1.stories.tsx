import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { H1 } from "ui/typography/h1";

export default {
	title: "ui/typography/h1",
	component: H1,
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
