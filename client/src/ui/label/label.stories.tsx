import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Label } from "ui/label";

export default {
	title: "ui/label",
	component: Label,
	parameters: {
		docs: {
			description: {
				component: "A generic label to caption items",
			},
		},
	},
} satisfies Meta<typeof Label>;

export const Default: Story<typeof Label> = {
	render: () => <Label>Email address</Label>,
};

export const Error: Story<typeof Label> = {
	render: () => <Label error>Email address</Label>,
};

export const Description: Story<typeof Label> = {
	render: () => <Label description>Email address</Label>,
};
