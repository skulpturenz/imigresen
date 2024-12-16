import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Badge } from "ui/badge";

export default {
	title: "ui/badge",
	parameters: {
		docs: {
			description: {
				component:
					"Displays a badge or a component that looks like a badge",
			},
		},
	},
} satisfies Meta<typeof Badge>;

export const Default: Story<typeof Badge> = {
	render: () => <Badge>Default</Badge>,
};

export const Secondary: Story<typeof Badge> = {
	render: () => <Badge variant="secondary">Secondary</Badge>,
};

export const Outline: Story<typeof Badge> = {
	render: () => <Badge variant="outline">Outline</Badge>,
};

export const Destructive: Story<typeof Badge> = {
	render: () => <Badge variant="destructive">Destructive</Badge>,
};
