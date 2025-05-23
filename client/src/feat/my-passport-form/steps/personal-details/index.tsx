import type { StepProps } from "feat/my-passport-form/types";
import { type Component } from "solid-js";
import { TextField, TextFieldLabel, TextFieldRoot } from "ui/text-field";

export const PersonalDetails: Component<StepProps> = props => {
	return (
		<>
			<div class="col-span-full">
				<props.Field name="hello">
					{(field, props) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel for={field.name}>
									Hello {field.value}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value}
								/>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>
		</>
	);
};
