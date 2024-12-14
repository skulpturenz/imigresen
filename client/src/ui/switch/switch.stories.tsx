import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Switch, SwitchControl, SwitchLabel, SwitchThumb } from "ui/switch";

export default {
	title: "ui/switch",
	component: Switch,
	parameters: {
		docs: {
			description: {
				component:
					"A control that allows the user to toggle between checked and not checked",
			},
		},
	},
} satisfies Meta<typeof Switch>;

export const Default: Story<typeof Switch> = {
	render: () => (
		<Switch class="flex items-center space-x-2" validationState="valid">
			<SwitchControl>
				<SwitchThumb />
			</SwitchControl>
			<SwitchLabel>Airplane Mode</SwitchLabel>
		</Switch>
	),
};

export const Invalid: Story<typeof Switch> = {
	render: () => (
		<Switch class="flex items-center space-x-2" validationState="invalid">
			<SwitchControl>
				<SwitchThumb />
			</SwitchControl>
			<SwitchLabel>Airplane Mode</SwitchLabel>
		</Switch>
	),
};

export const Disabled: Story<typeof Switch> = {
	render: () => (
		<Switch
			class="flex items-center space-x-2"
			validationState="invalid"
			disabled>
			<SwitchControl>
				<SwitchThumb />
			</SwitchControl>
			<SwitchLabel>Airplane Mode</SwitchLabel>
		</Switch>
	),
};
