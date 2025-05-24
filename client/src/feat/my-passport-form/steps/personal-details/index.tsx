import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import type { StepProps } from "feat/my-passport-form/types";
import { type Component } from "solid-js";
import { TextField, TextFieldLabel, TextFieldRoot } from "ui/text-field";

export const PersonalDetails: Component<StepProps> = props => {
	const t = useI18n<typeof resources>();

	return (
		<>
			<div class="col-span-full">
				<props.Field name="personalDetails.firstName">
					{(field, props) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel for={field.name}>
									{t("form.firstName.label")}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.firstName.placeholder",
									)}
									type="text"
									autocomplete="given-name"
								/>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>

			<div class="col-span-full">
				<props.Field name="personalDetails.lastName">
					{(field, props) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel for={field.name}>
									{t("form.lastName.label")}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t("form.lastName.placeholder")}
									type="text"
									autocomplete="family-name"
								/>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>

			<div>
				<props.Field name="personalDetails.emailAddress">
					{(field, props) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel for={field.name}>
									{t("form.emailAddress.label")}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.emailAddress.placeholder",
									)}
									type="text"
									autocomplete="email"
								/>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>

			<div>
				<props.Field name="personalDetails.mobileNumber">
					{(field, props) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel for={field.name}>
									{t("form.mobileNumber.label")}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.mobileNumber.placeholder",
									)}
									type="tel"
									autocomplete="tel"
								/>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>
		</>
	);
};
