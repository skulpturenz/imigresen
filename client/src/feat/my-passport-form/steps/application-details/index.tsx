import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import type { MyPassportForm, StepProps } from "feat/my-passport-form/types";
import { InputGroup } from "feat/my-passport-form/ui/input-group";
import { NextRow } from "feat/my-passport-form/ui/next-row";
import type { Component } from "solid-js";
import { Label } from "ui/label";
import {
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "ui/select";
import { ModularFormsSelect } from "ui/select/modular-forms-select";
import {
	TextField,
	TextFieldDescription,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export const ApplicationDetails: Component<StepProps> = props => {
	const t = useI18n<typeof resources>();

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

								<ModularFormsSelect<
									string,
									MyPassportForm,
									never,
									"input"
								>
									{...field}
									{...fieldProps}
									form={props.form}
									options={[
										"Apple",
										"Banana",
										"Blueberry",
										"Grapes",
										"Pineapple",
									]}
									placeholder={t(
										"form.applicationDetails.documentType.placeholder",
									)}
									itemComponent={props => (
										<SelectItem item={props.item}>
											{props.item.rawValue}
										</SelectItem>
									)}>
									<SelectTrigger>
										<SelectValue<string>>
											{state => state.selectedOption()}
										</SelectValue>
									</SelectTrigger>
									<SelectContent />
								</ModularFormsSelect>
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

									<ModularFormsSelect<
										string,
										MyPassportForm,
										never,
										"input"
									>
										{...field}
										{...fieldProps}
										form={props.form}
										options={[
											"Apple",
											"Banana",
											"Blueberry",
											"Grapes",
											"Pineapple",
										]}
										placeholder={t(
											"form.applicationDetails.requestType.placeholder",
										)}
										itemComponent={props => (
											<SelectItem item={props.item}>
												{props.item.rawValue}
											</SelectItem>
										)}>
										<SelectTrigger>
											<SelectValue<string>>
												{state =>
													state.selectedOption()
												}
											</SelectValue>
										</SelectTrigger>
										<SelectContent />
									</ModularFormsSelect>
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
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>
		</>
	);
};
