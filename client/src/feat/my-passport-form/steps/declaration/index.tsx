import { getValue } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import { RequestType, type StepProps } from "feat/my-passport-form/types";
import { dynamic } from "feat/my-passport-form/utils/dynamic";
import type { Component } from "solid-js";
import {
	Checkbox,
	CheckboxControl,
	CheckboxErrorMessage,
	CheckboxInputGroup,
	CheckboxLabel,
} from "ui/checkbox";
import {
	TextField,
	TextFieldDescription,
	TextFieldErrorMessage,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export const Declaration: Component<StepProps> = props => {
	const t = useI18n<typeof resources>();

	const requestTypeOptions = dynamic(RequestType, t("options.requestTypes"));

	const hasPreviousDocument = () =>
		[
			requestTypeOptions.Lost,
			requestTypeOptions.OutdatedPicturesDependents,
		].includes(
			getValue(props.form, "applicationDetails.requestType") ?? "",
		);

	const isRequestForDependent = () =>
		getValue(props.form, "applicationDetails.requestType") ===
		requestTypeOptions.OutdatedPicturesDependents;

	return (
		<>
			<div class="col-span-full">
				<props.Field name="declaration.confirmPreviousDocumentNumber">
					{(field, fieldProps) => (
						<TextFieldRoot
							validationState={field.error ? "invalid" : "valid"}>
							<TextFieldLabel>
								{t(
									"form.declaration.confirmPreviousDocumentNumber.label",
									hasPreviousDocument(),
								)}
							</TextFieldLabel>

							<TextField
								{...fieldProps}
								name={field.name}
								value={field.value ?? ""}
								placeholder={t(
									"form.declaration.confirmPreviousDocumentNumber.placeholder",
								)}
							/>

							<TextFieldDescription>
								{t(
									"form.declaration.confirmPreviousDocumentNumber.description",
								)}
							</TextFieldDescription>

							<TextFieldErrorMessage>
								{field.error}
							</TextFieldErrorMessage>
						</TextFieldRoot>
					)}
				</props.Field>
			</div>

			<div class="col-span-full">
				<props.Field name="declaration.isDetailsCorrect" type="boolean">
					{({ value, ...field }, fieldProps) => (
						<>
							<Checkbox
								{...field}
								name={field.name}
								checked={value}
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<CheckboxInputGroup>
									<CheckboxControl
										{...fieldProps}
										/// @ts-expect-error: TODO component fixes sweep
										ref={fieldProps.ref}
										class="self-start mt-1.5"
									/>

									<CheckboxLabel class="font-medium">
										{t(
											"form.declaration.isDetailsCorrect.label",
											isRequestForDependent(),
										)}
									</CheckboxLabel>
								</CheckboxInputGroup>

								<CheckboxErrorMessage>
									{field.error}
								</CheckboxErrorMessage>
							</Checkbox>
						</>
					)}
				</props.Field>
			</div>

			<div class="col-span-full">
				<props.Field
					name="declaration.declareTrueAndCorrect"
					type="boolean">
					{({ value, ...field }, fieldProps) => (
						<>
							<Checkbox
								{...field}
								name={field.name}
								checked={value}
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<CheckboxInputGroup>
									<CheckboxControl
										{...fieldProps}
										/// @ts-expect-error: TODO component fixes sweep
										ref={fieldProps.ref}
										class="self-start mt-1.5"
									/>

									<CheckboxLabel class="font-medium">
										{t(
											"form.declaration.declareTrueAndCorrect.label",
										).at(0)}

										<br />

										{t(
											"form.declaration.declareTrueAndCorrect.label",
										).at(1)}
									</CheckboxLabel>
								</CheckboxInputGroup>

								<CheckboxErrorMessage>
									{field.error}
								</CheckboxErrorMessage>
							</Checkbox>
						</>
					)}
				</props.Field>
			</div>

			<div class="col-span-full">
				<props.Field name="declaration.isLiable" type="boolean">
					{({ value, ...field }, fieldProps) => (
						<>
							<Checkbox
								{...field}
								name={field.name}
								checked={value}
								class="flex flex-col space-y-4"
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<CheckboxInputGroup>
									<CheckboxControl
										{...fieldProps}
										/// @ts-expect-error: TODO component fixes sweep
										ref={fieldProps.ref}
										class="self-start mt-1.5"
									/>

									<CheckboxLabel class="font-medium">
										{t("form.declaration.isLiable.label")}
									</CheckboxLabel>
								</CheckboxInputGroup>

								<CheckboxErrorMessage>
									{field.error}
								</CheckboxErrorMessage>
							</Checkbox>
						</>
					)}
				</props.Field>
			</div>
		</>
	);
};
