import { getValue } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import { spreadProps } from "core/utils";
import { debounce } from "es-toolkit";
import { formatOption, useAddressAutofill } from "feat/my-passport-form/hooks";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import type { MyPassportForm, StepProps } from "feat/my-passport-form/types";
import { AutocorrectTextField } from "feat/my-passport-form/ui/autocorrect-text-field";
import { InputGroup } from "feat/my-passport-form/ui/input-group";
import { NextRow } from "feat/my-passport-form/ui/next-row";
import { localeAsc } from "feat/my-passport-form/utils/sort";
import { createSignal, type Component } from "solid-js";
import {
	Combobox,
	ComboboxClearSelection,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
} from "ui/combobox";
import { ModularFormsCombobox } from "ui/combobox/modular-forms-combobox";
import { Label } from "ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "ui/select";
import {
	TextField,
	TextFieldDescription,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export const AddressDetails: Component<StepProps> = props => {
	const t = useI18n<typeof resources>();

	const { autofillOptions, onChangeOption } = useAddressAutofill({
		form: props.form,
	});

	const [showOptions, setShowOptions] = createSignal(false);
	const toggleShowOptions = () => setShowOptions(showOptions => !showOptions);

	const onSelectChange = onChangeOption;

	const hideOptions = () => {
		if (!showOptions()) {
			return;
		}

		toggleShowOptions();
	};

	const debouncedToggle = debounce(toggleShowOptions, 500);

	return (
		<>
			<div class="col-span-full">
				<props.Field name="addressDetails.streetAddress">
					{(field, props) => {
						// TODO: can't just compare street address
						const findAddressOption = (value?: string) =>
							autofillOptions().find(
								addressOption =>
									addressOption.streetAddress === value,
							);

						const onKeyDown = (event: KeyboardEvent) => {
							event.stopPropagation();
							event.stopImmediatePropagation();

							if (!autofillOptions().length || showOptions()) {
								return;
							}

							debouncedToggle();

							(event.target as HTMLInputElement).focus();
						};

						// TODO: click outside close
						// TODO: factor out
						// TODO: tried combobox but the listbox doesn't update until clicking outside
						// and making it show again
						// TODO: focus is lost when the select options show

						return (
							<>
								<TextFieldRoot
									validationState={
										field.error ? "invalid" : "valid"
									}>
									<TextFieldLabel>
										{t(
											"form.addressDetails.streetAddress.label",
										)}
									</TextFieldLabel>

									<Select
										options={autofillOptions()}
										itemComponent={props => (
											<SelectItem
												onClick={toggleShowOptions}
												item={props.item}>
												{formatOption(
													props.item.rawValue,
												)}
											</SelectItem>
										)}
										class="relative"
										onChange={onSelectChange}
										optionValue={formatOption}
										open={Boolean(
											showOptions() &&
												autofillOptions().length,
										)}
										value={findAddressOption(field.value)}>
										<TextField
											{...spreadProps(props)}
											value={field.value}
											onChange={props.onChange}
											onKeyDown={onKeyDown}
											autocomplete="shipping street-address"
										/>

										<SelectTrigger
											tabIndex={-1}
											class="absolute top-0 right-0 -z-30"
										/>
										<SelectContent
											onFocusOutside={hideOptions}
										/>
									</Select>
								</TextFieldRoot>
							</>
						);
					}}
				</props.Field>
			</div>

			<div>
				<props.Field name="addressDetails.countryCode">
					{(field, fieldProps) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>
									{t("form.addressDetails.countryCode.label")}
								</TextFieldLabel>

								<AutocorrectTextField
									{...field}
									{...fieldProps}
									form={props.form}
									name={field.name}
									value={field.value || ""}
									autocomplete="country-name"
									placeholder={t(
										"form.addressDetails.countryCode.placeholder",
									)}
									options={Object.keys(
										props.dropdownOptions()
											?.countryOptions ??
											Object.create(null),
									).sort(localeAsc)}
								/>

								<TextFieldDescription>
									{t(
										"form.addressDetails.countryCode.description",
									)}
								</TextFieldDescription>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>

			<NextRow>
				<div>
					<props.Field name="addressDetails.postcode">
						{(field, props) => (
							<>
								<TextFieldRoot
									validationState={
										field.error ? "invalid" : "valid"
									}>
									<TextFieldLabel>
										{t(
											"form.addressDetails.postcode.label",
										)}
									</TextFieldLabel>

									<TextField
										{...props}
										name={field.name}
										value={field.value ?? ""}
										placeholder={t(
											"form.addressDetails.postcode.placeholder",
										)}
										type="text"
										autocomplete="postal-code"
									/>
								</TextFieldRoot>
							</>
						)}
					</props.Field>
				</div>

				<div>
					<props.Field name="addressDetails.state">
						{(field, fieldProps) => {
							const findOption = (value?: string) =>
								props
									.dropdownOptions()
									?.addressDetailsStateOptions.find(
										option => option === value,
									);

							return (
								<>
									<InputGroup>
										<Label>
											{t(
												"form.addressDetails.state.label",
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
											value={
												findOption(field.value) ?? ""
											}
											options={Object.values(
												props.dropdownOptions()
													?.addressDetailsStateOptions ??
													[],
											).sort(localeAsc)}
											optionValue={state => state}
											placeholder={t(
												"form.addressDetails.state.placeholder",
											)}
											disabled={
												!getValue(
													props.form,
													"addressDetails.countryCode",
												)
											}
											itemComponent={props => (
												<ComboboxItem item={props.item}>
													{props.item.rawValue}
												</ComboboxItem>
											)}
											sameWidth>
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
								</>
							);
						}}
					</props.Field>
				</div>
			</NextRow>

			<div>
				<props.Field name="addressDetails.city">
					{(field, props) => (
						<>
							<TextFieldRoot
								validationState={
									field.error ? "invalid" : "valid"
								}>
								<TextFieldLabel>
									{t("form.addressDetails.city.label")}
								</TextFieldLabel>

								<TextField
									{...props}
									name={field.name}
									value={field.value ?? ""}
									placeholder={t(
										"form.addressDetails.city.placeholder",
									)}
									type="text"
									autocomplete="address-level2"
								/>
							</TextFieldRoot>
						</>
					)}
				</props.Field>
			</div>
		</>
	);
};
