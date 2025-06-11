import { getValue } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import { RequestType, type StepProps } from "feat/my-passport-form/types";
import { InputGroup } from "feat/my-passport-form/ui/input-group";
import { dynamic } from "feat/my-passport-form/utils/dynamic";
import { Show, type Component } from "solid-js";
import { Label } from "ui/label";
import {
	TextField,
	TextFieldDescription,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";
import { cn } from "ui/utils";

export const PreviousDocuments: Component<StepProps> = props => {
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
			<props.Field name="previousDocuments.previousDocumentNumber">
				{(field, fieldProps) => (
					<div class="col-span-full">
						<TextFieldRoot
							validationState={field.error ? "invalid" : "valid"}
							disabled={!hasPreviousDocument()}>
							<TextFieldLabel>
								{t(
									"form.previousDocuments.previousDocumentNumber.label",
								)}
							</TextFieldLabel>

							<TextField
								{...fieldProps}
								name={field.name}
								value={field.value ?? ""}
								placeholder={t(
									"form.previousDocuments.previousDocumentNumber.placeholder",
								)}
							/>

							<Show when={!hasPreviousDocument()}>
								<TextFieldDescription>
									{t(
										"form.previousDocuments.previousDocumentNumber.description",
									)}
								</TextFieldDescription>
							</Show>
						</TextFieldRoot>
					</div>
				)}
			</props.Field>

			<props.Field name="previousDocuments.dependentCaregiverFirstName">
				{(field, fieldProps) => (
					<div class="col-span-1">
						<TextFieldRoot
							validationState={field.error ? "invalid" : "valid"}
							disabled={!isRequestForDependent()}>
							<TextFieldLabel>
								{t(
									"form.previousDocuments.dependentCaregiverFirstName.label",
								)}
							</TextFieldLabel>

							<TextField
								{...fieldProps}
								name={field.name}
								value={field.value ?? ""}
								placeholder={t(
									"form.previousDocuments.dependentCaregiverFirstName.placeholder",
								)}
							/>

							<Show when={!isRequestForDependent()}>
								<TextFieldDescription>
									{t(
										"form.previousDocuments.dependentCaregiverFirstName.description",
									)}
								</TextFieldDescription>
							</Show>
						</TextFieldRoot>
					</div>
				)}
			</props.Field>

			<props.Field name="previousDocuments.dependentCaregiverLastName">
				{(field, fieldProps) => (
					<div class="col-span-1">
						<TextFieldRoot
							validationState={field.error ? "invalid" : "valid"}
							disabled={!isRequestForDependent()}>
							<TextFieldLabel>
								{t(
									"form.previousDocuments.dependentCaregiverLastName.label",
								)}
							</TextFieldLabel>

							<TextField
								{...fieldProps}
								name={field.name}
								value={field.value ?? ""}
								placeholder={t(
									"form.previousDocuments.dependentCaregiverLastName.placeholder",
								)}
							/>

							<Show when={!isRequestForDependent()}>
								<TextFieldDescription>
									{t(
										"form.previousDocuments.dependentCaregiverLastName.description",
									)}
								</TextFieldDescription>
							</Show>
						</TextFieldRoot>
					</div>
				)}
			</props.Field>

			<props.Field name="previousDocuments.dependentCaregiverMyKadNumber">
				{(field, fieldProps) => (
					<div class="col-span-full">
						<TextFieldRoot
							validationState={field.error ? "invalid" : "valid"}
							disabled={!isRequestForDependent()}>
							<TextFieldLabel>
								{t(
									"form.previousDocuments.dependentCaregiverMyKadNumber.label",
								)}
							</TextFieldLabel>

							<TextField
								{...fieldProps}
								name={field.name}
								value={field.value ?? ""}
								placeholder={t(
									"form.previousDocuments.dependentCaregiverMyKadNumber.placeholder",
								)}
							/>

							<Show when={!isRequestForDependent()}>
								<TextFieldDescription>
									{t(
										"form.previousDocuments.dependentCaregiverFirstName.description",
									)}
								</TextFieldDescription>
							</Show>
						</TextFieldRoot>
					</div>
				)}
			</props.Field>

			<props.Field name="previousDocuments.dependentCaregiverSignature">
				{(_field, _fieldProps) => (
					<div class="col-span-full">
						<InputGroup>
							<Label>
								{t(
									"form.previousDocuments.dependentCaregiverSignature.label",
								)}
							</Label>

							<div
								// TODO: signature component
								class={cn(
									"w-full bg-muted text-muted-foreground h-60",
									"transition",
									!isRequestForDependent() // disabled styles
										? "cursor-not-allowed opacity-50"
										: "opacity-50 hover:opacity-100",
								)}
							/>

							<Show when={isRequestForDependent()}>
								<Label description>
									{t(
										"form.previousDocuments.dependentCaregiverSignature.descriptionEnabled",
									)}
								</Label>
							</Show>

							<Show when={!isRequestForDependent()}>
								<Label description>
									{t(
										"form.previousDocuments.dependentCaregiverSignature.descriptionDisabled",
									)}
								</Label>
							</Show>
						</InputGroup>
					</div>
				)}
			</props.Field>
		</>
	);
};
