import type { Component } from "solid-js";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { useProfileForm } from "feat/profile/hooks/use-profile-form";
import { constants } from "feat/profile/ui/constants";
import {
	TextField,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export const Profile: Component = () => {
	const userContext = useContext(UserContext);
	const { form, Components } = useProfileForm();

	return (
		<>
			<Components.Form of={form}>
				<div class={constants.grid}>
					<Components.Field name="email">
						{(field, props) => (
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>Email</TextFieldLabel>
								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={userContext().profile?.email ?? ""}
									type="text"
									autocomplete="email"
								/>
							</TextFieldRoot>
						)}
					</Components.Field>

					<Components.Field name="firstName">
						{(field, props) => (
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>First name</TextFieldLabel>
								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={userContext().profile?.firstName ?? ""}
									type="text"
									autocomplete="given-name"
								/>
							</TextFieldRoot>
						)}
					</Components.Field>

					<Components.Field name="lastName">
						{(field, props) => (
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>Last name</TextFieldLabel>
								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={userContext().profile?.lastName ?? ""}
									type="text"
									autocomplete="family-name"
								/>
							</TextFieldRoot>
						)}
					</Components.Field>
				</div>
			</Components.Form>
		</>
	);
};
