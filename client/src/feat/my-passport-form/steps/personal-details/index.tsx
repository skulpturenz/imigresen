import { getValue, type FieldEvent } from "@modular-forms/solid";
import { styles } from "core/constants/styles";
import { useI18n } from "core/context/i18n";
import { localeAsc } from "core/data/sort";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import { type Option, type StepProps } from "feat/my-passport-form/types";
import { InputGroup } from "feat/my-passport-form/ui/input-group";
import { NextRow } from "feat/my-passport-form/ui/next-row";
import { Show, type Component } from "solid-js";
import {
	Combobox,
	ComboboxClearSelection,
	ComboboxContent,
	ComboboxErrorMessage,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
} from "ui/combobox";
import { DatePickerErrorMessage } from "ui/date-picker";
import { SingleDatePicker } from "ui/date-picker/single-date-picker";
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

export const PersonalDetails: Component<StepProps> = props => {
	const t = useI18n<typeof resources>();

	const genderOptions = () => {
		const options = Object.entries<string>(
			props.dropdownOptions()?.genderOptions ?? Object.create(null),
		).map(([code, label]) => ({ key: code, label }));

		return options;
	};

	const relationshipStatusOptions = () => {
		const options = Object.entries<string>(
			props.dropdownOptions()?.relationshipStatusOptions ??
				Object.create(null),
		).map(([code, label]) => ({ key: code, label }));

		return options;
	};

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

								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
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

								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
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
									{t(
										"form.optional",
										t(
											"form.personalDetails.nickName.label",
										),
									)}
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

								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
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

								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
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

								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
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

								<Select
									{...fieldProps}
									value={genderOptions().find(
										option => option.key === field.value,
									)}
									options={genderOptions()}
									optionValue={gender => gender.key}
									optionTextValue={gender => gender.label}
									placeholder={t(
										"form.personalDetails.genderCode.placeholder",
									)}
									itemComponent={props => (
										<SelectItem item={props.item}>
											{props.item.rawValue.label}
										</SelectItem>
									)}
									validationState={
										field.error ? "invalid" : "valid"
									}>
									<SelectTrigger class="w-full">
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

								<Select
									{...fieldProps}
									value={relationshipStatusOptions().find(
										option => option.key === field.value,
									)}
									options={relationshipStatusOptions()}
									optionValue={relationshipStatus =>
										relationshipStatus.key
									}
									optionTextValue={relationshipStatus =>
										relationshipStatus.label
									}
									placeholder={t(
										"form.personalDetails.relationshipStatusCode.placeholder",
									)}
									itemComponent={props => (
										<SelectItem item={props.item}>
											{props.item.rawValue.label}
										</SelectItem>
									)}
									validationState={
										field.error ? "invalid" : "valid"
									}>
									<SelectTrigger class="w-full">
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

									<TextFieldErrorMessage>
										{field.error}
									</TextFieldErrorMessage>
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

									<SingleDatePicker
										{...fieldProps}
										value={field.value}
										placeholder={t(
											"form.personalDetails.dateOfBirth.placeholder",
										)}
										autocomplete="bday"
										invalid={Boolean(field.error)}>
										<DatePickerErrorMessage>
											{field.error}
										</DatePickerErrorMessage>
									</SingleDatePicker>
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
							<InputGroup>
								<Label>
									{t(
										"form.personalDetails.countryOfBirthCode.label",
									)}
								</Label>

								<Combobox
									{...fieldProps}
									value={field.value}
									options={Object.values<string>(
										props.dropdownOptions()
											?.countryOptions ??
											Object.create(null),
									).sort(localeAsc)}
									onInput={fieldProps.onInput}
									invalid={Boolean(field.error)}>
									<ComboboxTrigger>
										<ComboboxInput>
											<ComboboxClearSelection />
										</ComboboxInput>
									</ComboboxTrigger>

									<ComboboxContent>
										{(item: string) => (
											<ComboboxItem item={item}>
												{item}
											</ComboboxItem>
										)}
									</ComboboxContent>

									<ComboboxErrorMessage>
										{field.error}
									</ComboboxErrorMessage>
								</Combobox>
							</InputGroup>
						</>
					)}
				</props.Field>
			</div>

			<props.Field name="personalDetails.stateOfBirth">
				{(field, props) => {
					return (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel info="form.personalDetails.stateOfBirth.info">
									{t(
										"form.personalDetails.stateOfBirth.label",
									)}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.personalDetails.stateOfBirth.placeholder",
									)}
									type="text"
									autocomplete="address-level3"
								/>

								<Show when={!styles.device.hasHover()}>
									<TextFieldDescription>
										{t(
											"form.personalDetails.stateOfBirth.info",
										)}
									</TextFieldDescription>
								</Show>

								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
							</TextFieldRoot>
						</>
					);
				}}
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
