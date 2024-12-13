import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { H2 } from "ui/typography/h2";

export default {
	title: "ui/typography/h2",
	component: H2,
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
