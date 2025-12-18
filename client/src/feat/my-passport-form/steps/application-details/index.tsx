import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import {
	DocumentType,
	RequestType,
	type Option,
	type StepProps,
} from "feat/my-passport-form/types";
import { InputGroup } from "feat/my-passport-form/ui/input-group";
import { NextRow } from "feat/my-passport-form/ui/next-row";
import { dynamic } from "feat/my-passport-form/utils/dynamic";
import type { Component } from "solid-js";
import { Label } from "ui/label";
import {
	Select,
	SelectClearSelection,
	SelectContent,
	SelectErrorMessage,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "ui/select";
import {
	TextField,
	TextFieldDescription,
	TextFieldErrorMessage,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export const ApplicationDetails: Component<StepProps> = props => {
	const t = useI18n<typeof resources>();

	const documentTypeOptions = () => {
		const documentTypes = dynamic(
			DocumentType,
			t("options.documentTypes"),
			false,
		);

		const options = Object.entries<string>(
			documentTypes ?? Object.create(null),
		).map(([documentType, label]) => ({ key: documentType, label }));

		return options;
	};

	const requestTypeOptions = () => {
		const requestTypes = dynamic(
			RequestType,
			t("options.requestTypes"),
			false,
		);

		const options = Object.entries<string>(
			requestTypes ?? Object.create(null),
		).map(([requestType, label]) => ({ key: requestType, label }));

		return options;
	};

	return (
		<>
			<div class="col-span-1">
				<props.Field name="applicationDetails.documentType">
					{(field, fieldProps) => (
						<>
							<InputGroup>
								<Label>
									{t(
										"form.applicationDetails.documentType.label",
									)}
								</Label>

								<Select
									{...fieldProps}
									value={documentTypeOptions().find(
										option => option.key === field.value,
									)}
									options={documentTypeOptions()}
									placeholder={t(
										"form.applicationDetails.documentType.placeholder",
									)}
									optionValue={documentType =>
										documentType.key
									}
									optionTextValue={documentType =>
										documentType.label
									}
									itemComponent={props => (
										<SelectItem item={props.item}>
											{props.item.rawValue.label}
										</SelectItem>
									)}
									validationState={
										field.error ? "invalid" : "valid"
									}>
									<SelectTrigger>
										<SelectValue<Option<string, string>>>
											{state => {
												return (
													<>
														<div>
															{
																state.selectedOption()
																	?.label
															}
														</div>

														<SelectClearSelection
															onClear={
																state.clear
															}
														/>
													</>
												);
											}}
										</SelectValue>
									</SelectTrigger>
									<SelectContent />

									<SelectErrorMessage>
										{field.error}
									</SelectErrorMessage>
								</Select>
							</InputGroup>
						</>
					)}
				</props.Field>
			</div>

			<NextRow class="col-span-1">
				<div>
					<props.Field name="applicationDetails.requestType">
						{(field, fieldProps) => (
							<>
								<InputGroup>
									<Label>
										{t(
											"form.applicationDetails.requestType.label",
										)}
									</Label>

									<Select
										{...fieldProps}
										value={requestTypeOptions().find(
											option =>
												option.key === field.value,
										)}
										options={requestTypeOptions()}
										placeholder={t(
											"form.applicationDetails.requestType.placeholder",
										)}
										optionValue={requestType =>
											requestType.key
										}
										optionTextValue={requestType =>
											requestType.label
										}
										itemComponent={props => (
											<SelectItem item={props.item}>
												{props.item.rawValue.label}
											</SelectItem>
										)}
										validationState={
											field.error ? "invalid" : "valid"
										}>
										<SelectTrigger>
											<SelectValue<
												Option<string, string>
											>>
												{state => {
													return (
														<>
															<div>
																{
																	state.selectedOption()
																		?.label
																}
															</div>

															<SelectClearSelection
																onClear={
																	state.clear
																}
															/>
														</>
													);
												}}
											</SelectValue>
										</SelectTrigger>
										<SelectContent />

										<SelectErrorMessage>
											{field.error}
										</SelectErrorMessage>
									</Select>
								</InputGroup>
							</>
						)}
					</props.Field>
				</div>
			</NextRow>

			<div class="col-span-full">
				<props.Field name="applicationDetails.myKadNumber">
					{(field, fieldProps) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>
									{t(
										"form.applicationDetails.myKadNumber.label",
									)}
								</TextFieldLabel>

								<TextField
									{...fieldProps}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.applicationDetails.myKadNumber.placeholder",
									)}
								/>

								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>

			<div class="col-span-full">
				<props.Field name="applicationDetails.birthDocumentNumber">
					{(field, fieldProps) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>
									{t(
										"form.applicationDetails.birthDocumentNumber.label",
									)}
								</TextFieldLabel>

								<TextField
									{...fieldProps}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.applicationDetails.birthDocumentNumber.placeholder",
									)}
								/>

								<TextFieldDescription>
									{t(
										"form.applicationDetails.birthDocumentNumber.description",
									)}
								</TextFieldDescription>

								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>
		</>
	);
};
