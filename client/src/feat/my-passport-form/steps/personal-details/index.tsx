import { getValue, type FieldEvent } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import {
	type MyPassportForm,
	type StepProps,
} from "feat/my-passport-form/types";
import { AutocorrectTextField } from "feat/my-passport-form/ui/autocorrect-text-field";
import { InputGroup } from "feat/my-passport-form/ui/input-group";
import { NextRow } from "feat/my-passport-form/ui/next-row";
import { Show, type Component } from "solid-js";
import {
	Combobox,
	ComboboxClearSelection,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
} from "ui/combobox";
import { ModularFormsCombobox } from "ui/combobox/modular-forms-combobox";
import { ModularFormsDateRangePicker } from "ui/date-picker/modular-forms-date-range-picker";
import { Label } from "ui/label";
import {
	SelectClearSelection,
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
								<TextFieldLabel>
									{t("form.personalDetails.firstName.label")}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.personalDetails.firstName.placeholder",
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
								<TextFieldLabel>
									{t("form.personalDetails.lastName.label")}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.personalDetails.lastName.placeholder",
									)}
									type="text"
									autocomplete="family-name"
								/>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>

			<div class="col-span-full">
				<props.Field name="personalDetails.nickName">
					{(field, props) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>
									{t("form.personalDetails.nickName.label")}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.personalDetails.nickName.placeholder",
									)}
									type="text"
									autocomplete="nickname"
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
								<TextFieldLabel>
									{t(
										"form.personalDetails.emailAddress.label",
									)}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.personalDetails.emailAddress.placeholder",
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
								<TextFieldLabel>
									{t(
										"form.personalDetails.mobileNumber.label",
									)}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.personalDetails.mobileNumber.placeholder",
									)}
									type="tel"
									autocomplete="tel"
								/>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>

			<div>
				<props.Field name="personalDetails.genderCode">
					{(field, fieldProps) => (
						<>
							<InputGroup>
								<Label>
									{t("form.personalDetails.genderCode.label")}
								</Label>

								<ModularFormsSelect<
									string,
									MyPassportForm,
									never,
									"input"
								>
									form={props.form}
									{...field}
									{...fieldProps}
									value={field.value ?? null}
									options={[
										"Apple",
										"Banana",
										"Blueberry",
										"Grapes",
										"Pineapple",
									]}
									placeholder={t(
										"form.personalDetails.genderCode.placeholder",
									)}
									itemComponent={props => (
										<SelectItem item={props.item}>
											{props.item.rawValue}
										</SelectItem>
									)}>
									<SelectTrigger class="w-full">
										<SelectValue<string>>
											{state => {
												return (
													<>
														<div>
															{state.selectedOption()}
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
								</ModularFormsSelect>
							</InputGroup>
						</>
					)}
				</props.Field>
			</div>

			<div>
				<props.Field name="personalDetails.relationshipStatusCode">
					{(field, fieldProps) => (
						<>
							<InputGroup>
								<Label>
									{t(
										"form.personalDetails.relationshipStatusCode.label",
									)}
								</Label>

								<ModularFormsSelect<
									string,
									MyPassportForm,
									never,
									"input"
								>
									form={props.form}
									{...field}
									{...fieldProps}
									value={field.value ?? null}
									options={[
										"Apple",
										"Banana",
										"Blueberry",
										"Grapes",
										"Pineapple",
									]}
									placeholder={t(
										"form.personalDetails.relationshipStatusCode.placeholder",
									)}
									itemComponent={props => (
										<SelectItem item={props.item}>
											{props.item.rawValue}
										</SelectItem>
									)}>
									<SelectTrigger class="w-full">
										<SelectValue<string>>
											{state => {
												return (
													<>
														<div>
															{state.selectedOption()}{" "}
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
								</ModularFormsSelect>
							</InputGroup>
						</>
					)}
				</props.Field>
			</div>

			<NextRow class="col-span-1">
				<div>
					<props.Field
						name="personalDetails.height"
						type="number"
						transform={transformNumber}>
						{(field, fieldProps) => (
							<>
								<TextFieldRoot
									validationState={
										field.error ? "invalid" : "valid"
									}>
									<TextFieldLabel>
										{t("form.personalDetails.height.label")}
									</TextFieldLabel>

									<TextField
										{...fieldProps}
										name={field.name}
										value={field.value || ""}
										placeholder={t(
											"form.personalDetails.height.placeholder",
										)}
									/>

									<TextFieldDescription>
										<Show
											when={
												!getValue(
													props.form,
													"personalDetails.height",
												)
											}>
											{t(
												"form.personalDetails.height.descriptionDefault",
											)}
										</Show>

										<Show
											when={isCentimetres(
												getValue(
													props.form,
													"personalDetails.height",
												) as number,
											)}>
											{t(
												"form.personalDetails.height.descriptionCentimetres",
											)}
										</Show>

										<Show
											when={isMetres(
												getValue(
													props.form,
													"personalDetails.height",
												) as number,
											)}>
											{t(
												"form.personalDetails.height.descriptionMetres",
											)}
										</Show>
									</TextFieldDescription>
								</TextFieldRoot>
							</>
						)}
					</props.Field>
				</div>
			</NextRow>

			<NextRow>
				<div>
					<props.Field name="personalDetails.dateOfBirth" type="Date">
						{(field, fieldProps) => (
							<>
								<InputGroup>
									<Label>
										{t(
											"form.personalDetails.dateOfBirth.label",
										)}
									</Label>

									<ModularFormsDateRangePicker
										form={props.form}
										{...field}
										{...fieldProps}
										/// @ts-expect-error: expects a div not an input
										ref={fieldProps.ref}
										placeholder={t(
											"form.personalDetails.dateOfBirth.placeholder",
										)}
									/>
								</InputGroup>
							</>
						)}
					</props.Field>
				</div>
			</NextRow>

			<div>
				<props.Field
					name="personalDetails.countryOfBirthCode"
					type="string">
					{(field, fieldProps) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>
									{t(
										"form.personalDetails.countryOfBirthCode.label",
									)}
								</TextFieldLabel>

								<AutocorrectTextField
									{...field}
									{...fieldProps}
									form={props.form}
									name={field.name}
									value={field.value || ""}
									placeholder={t(
										"form.personalDetails.countryOfBirthCode.placeholder",
									)}
									options={[
										"Malaysia",
										"Afghanistan",
										"Albania",
										"Algeria",
										"Andorra",
										"Angola",
										"Argentina",
										"Armenia",
										"Australia",
										"New Zealand",
										"United states of America",
									]}
								/>

								<TextFieldDescription>
									{t(
										"form.personalDetails.countryOfBirthCode.description",
									)}
								</TextFieldDescription>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>

			<props.Field name="personalDetails.stateOfBirth">
				{(field, fieldProps) => (
					<>
						<Show
							when={getValue(
								props.form,
								"personalDetails.countryOfBirthCode",
							)}>
							<InputGroup>
								<Label>
									{t(
										"form.personalDetails.stateOfBirth.label",
									)}
								</Label>

								<ModularFormsCombobox<
									string,
									MyPassportForm,
									never,
									"input"
								>
									{...field}
									{...fieldProps}
									form={props.form}
									options={[
										"Next.js",
										"Astro",
										"Qwik",
										"SolidStart",
										"Nuxt.js",
									]}
									value={field.value ?? ""}
									placeholder={t(
										"form.personalDetails.stateOfBirth.placeholder",
									)}
									itemComponent={props => (
										<ComboboxItem item={props.item}>
											{props.item.rawValue}
										</ComboboxItem>
									)}>
									<Combobox.Control<string>>
										{state => {
											return (
												<>
													<ComboboxTrigger class="relative">
														<ComboboxInput />

														<ComboboxClearSelection
															selectedOptions={state.selectedOptions()}
															onClear={
																state.clear
															}
														/>
													</ComboboxTrigger>
												</>
											);
										}}
									</Combobox.Control>
									<ComboboxContent />
								</ModularFormsCombobox>
							</InputGroup>
						</Show>
					</>
				)}
			</props.Field>
		</>
	);
};

const isMetres = (x: number | string) => {
	if (!x) {
		return false;
	}

	if (Number.isNaN(Number(x))) {
		return false;
	}

	if (Math.floor(Number(x) / 10)) {
		return false;
	}

	return true;
};

const isCentimetres = (x: number | string) => {
	if (!x) {
		return false;
	}

	if (Number.isNaN(Number(x))) {
		return false;
	}

	return !isMetres(x);
};

const transformNumber = (_: any, event: FieldEvent) => {
	const input = event.target as HTMLInputElement;
	const maybeNumber = Number(input.value);

	if (Number.isNaN(maybeNumber)) {
		return;
	}

	return maybeNumber;
};
