import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { TextArea } from "ui/text-area";
import {
	TextFieldDescription,
	TextFieldErrorMessage,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export default {
	title: "ui/text-area",
} satisfies Meta;

export const Valid: Story = {
	render: () => (
		<TextFieldRoot class="w-96">
			<TextFieldLabel>Your message</TextFieldLabel>
			<TextArea placeholder="Type your message here." />
			<TextFieldDescription>
				Enter a really really long message
			</TextFieldDescription>
		</TextFieldRoot>
	),
};

export const Invalid: Story<typeof TextArea> = {
	render: () => (
		<TextFieldRoot class="w-96" validationState="invalid">
			<TextFieldLabel>Your message</TextFieldLabel>
			<TextArea placeholder="Type your message here." />
			<TextFieldDescription class="data-[invalid]:hidden">
				Enter a really really long message
			</TextFieldDescription>
			<TextFieldErrorMessage>30 characters max</TextFieldErrorMessage>
		</TextFieldRoot>
	),
};

export const Disabled: Story<typeof TextArea> = {
	render: () => (
		<TextFieldRoot class="w-96" disabled>
			<TextFieldLabel>Your message</TextFieldLabel>
			<TextArea placeholder="Type your message here." />
			<TextFieldErrorMessage>30 characters max</TextFieldErrorMessage>
		</TextFieldRoot>
	),
};
