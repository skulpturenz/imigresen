import { Form } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import { useProfileForm } from "feat/profile/hooks/use-profile-form";
import type { resources } from "feat/profile/resources/i18n/en-us";
import { constants } from "feat/profile/ui/constants";
import type { Component } from "solid-js";
import { Button } from "ui/button";
import {
	TextField,
	TextFieldErrorMessage,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export const Profile: Component = () => {
	const t = useI18n<typeof resources>();
	const { form, submitHandler, isMutating, Components } = useProfileForm();

	return (
		<Form of={form} onSubmit={submitHandler}>
			<div class={constants.grid}>
				<Components.Field name="userDetails.firstName">
					{(field, props) => (
						<TextFieldRoot
							validationState={field.error ? "invalid" : "valid"}>
							<TextFieldLabel>
								{t("form.userDetails.firstName.label")}
							</TextFieldLabel>
							<TextField
								{...props}
								name={field.name}
								value={field.value ?? ""}
								placeholder=""
								type="text"
								autocomplete="given-name"
							/>
							<TextFieldErrorMessage>
								{field.error}
							</TextFieldErrorMessage>
						</TextFieldRoot>
					)}
				</Components.Field>

				<Components.Field name="userDetails.lastName">
					{(field, props) => (
						<TextFieldRoot
							validationState={field.error ? "invalid" : "valid"}>
							<TextFieldLabel>
								{t("form.userDetails.lastName.label")}
							</TextFieldLabel>
							<TextField
								{...props}
								name={field.name}
								value={field.value ?? ""}
								placeholder=""
								type="text"
								autocomplete="family-name"
							/>
							<TextFieldErrorMessage>
								{field.error}
							</TextFieldErrorMessage>
						</TextFieldRoot>
					)}
				</Components.Field>

				<div class="col-span-full">
					<Components.Field name="userDetails.email">
						{(field, props) => (
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>
									{t("form.userDetails.email.label")}
								</TextFieldLabel>
								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder=""
									type="text"
									autocomplete="email"
								/>
								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
							</TextFieldRoot>
						)}
					</Components.Field>
				</div>
			</div>
			<div class="flex justify-end gap-2 mt-4">
				<Button variant="destructive" disabled={isMutating() || form.invalid}>
					{t("buttons.cancel")}
				</Button>
				<Button type="submit" variant="default" disabled={isMutating() || form.invalid}>
					{t("buttons.submit")}
				</Button>
			</div>
		</Form>
	);
};
