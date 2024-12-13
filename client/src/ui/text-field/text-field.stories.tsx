import type { Meta, StoryObj as Story } from "storybook-solidjs";
import {
	TextField,
	TextFieldErrorMessage,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export default {
	title: "ui/text-field",
	parameters: {
		docs: {
			description: {
				component:
					"A text input that allow users to input custom text entries with a keyboard",
			},
		},
	},
} satisfies Meta;

export const Valid: Story = {
	render: () => (
		<TextFieldRoot class="w-96" validationState="valid">
			<TextFieldLabel>Email</TextFieldLabel>
			<TextField type="email" placeholder="Email" />
			<TextFieldErrorMessage>Email is required.</TextFieldErrorMessage>
		</TextFieldRoot>
	),
};

export const Invalid: Story<typeof TextField> = {
	render: () => (
		<TextFieldRoot class="w-96" validationState="invalid">
			<TextFieldLabel>Email</TextFieldLabel>
			<TextField type="email" placeholder="Email" />
			<TextFieldErrorMessage>Email is required.</TextFieldErrorMessage>
		</TextFieldRoot>
	),
};

export const Disabled: Story<typeof TextField> = {
	render: () => (
		<TextFieldRoot class="w-96" disabled>
			<TextFieldLabel>Email</TextFieldLabel>
			<TextField type="email" placeholder="Email" />
			<TextFieldErrorMessage>Email is required.</TextFieldErrorMessage>
		</TextFieldRoot>
	),
};
