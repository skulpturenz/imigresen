import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Checkbox, CheckboxControl, CheckboxLabel } from "ui/checkbox";

export default {
	title: "ui/checkbox",
	component: Checkbox,
	parameters: {
		docs: {
			description: {
				component:
					"A control that allows the user to toggle between checked and not checked.",
			},
		},
	},
} satisfies Meta<typeof Checkbox>;

export const Default: Story<typeof Checkbox> = {
	render: () => (
		<Checkbox class="flex items-center space-x-2">
			<CheckboxControl />
			<CheckboxLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Accept terms and conditions
			</CheckboxLabel>
		</Checkbox>
	),
};
