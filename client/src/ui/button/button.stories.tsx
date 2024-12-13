import { X } from "lucide-solid";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Button } from "ui/button";

export default {
	title: "ui/button",
	component: Button,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export const DefaultVariant: Story<typeof Button> = {
	args: {
		variant: "default",
		children: "Button",
	},
};

export const DestructiveVariant: Story<typeof Button> = {
	args: {
		variant: "destructive",
		children: "Button",
	},
};

export const OutlineVariant: Story<typeof Button> = {
	args: {
		variant: "outline",
		children: "Button",
	},
};

export const SecondaryVariant: Story<typeof Button> = {
	args: {
		variant: "secondary",
		children: "Button",
	},
};

export const GhostVariant: Story<typeof Button> = {
	args: {
		variant: "ghost",
		children: "Button",
	},
};

export const LinkVariant: Story<typeof Button> = {
	args: {
		variant: "link",
		children: "Button",
	},
};

export const DefaultSize: Story<typeof Button> = {
	args: {
		size: "default",
		children: "Button",
	},
};

export const LargeSize: Story<typeof Button> = {
	args: {
		size: "lg",
		children: "Button",
	},
};

export const SmallSize: Story<typeof Button> = {
	args: {
		size: "sm",
		children: "Button",
	},
};

export const IconSize: Story<typeof Button> = {
	args: {
		size: "icon",
		children: <X />,
	},
};
