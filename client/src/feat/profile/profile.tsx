import { Form } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
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
	const userContext = useContext(UserContext);
	const { form, Components } = useProfileForm();

	return (
		<>
			<Form of={form}>
				<div class={constants.grid}>
					<Components.Field name="firstName">
						{(field, props) => (
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>
									{t("form.firstName.label")}
								</TextFieldLabel>
								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={
										userContext().profile?.firstName ?? ""
									}
									type="text"
									autocomplete="given-name"
								/>
								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
							</TextFieldRoot>
						)}
					</Components.Field>

					<Components.Field name="lastName">
						{(field, props) => (
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>
									{t("form.lastName.label")}
								</TextFieldLabel>
								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={
										userContext().profile?.lastName ?? ""
									}
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
						<Components.Field name="email">
							{(field, props) => (
								<TextFieldRoot
									validationState={
										field.error ? "invalid" : "valid"
									}>
									<TextFieldLabel>
										{t("form.email.label")}
									</TextFieldLabel>
									<TextField
										{...props}
										name={field.name}
										value={field.value ?? ""}
										placeholder={
											userContext().profile?.email ?? ""
										}
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
			</Form>
			<div class="flex justify-end gap-2 mt-4">
				<Button variant="destructive">{t("buttons.cancel")}</Button>
				<Button variant="default">{t("buttons.submit")}</Button>
			</div>
		</>
	);
};
