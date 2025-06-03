import { getValue } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import { formatOption, useAddressAutofill } from "feat/my-passport-form/hooks";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import type { StepProps } from "feat/my-passport-form/types";
import { AutocorrectTextField } from "feat/my-passport-form/ui/autocorrect-text-field";
import { InputGroup } from "feat/my-passport-form/ui/input-group";
import { NextRow } from "feat/my-passport-form/ui/next-row";
import { localeAsc } from "feat/my-passport-form/utils/sort";
import { createMemo, For, type Component } from "solid-js";
import {
	Combobox,
	ComboboxClearSelection,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
	createListCollection,
	type ComboboxInputValueChangeDetails,
	type ComboboxSelectionDetails,
} from "ui/combobox";
import { ModularFormsCombobox } from "ui/combobox/modular-forms-combobox";
import { Label } from "ui/label";
import {
	TextField,
	TextFieldDescription,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export const AddressDetails: Component<StepProps> = props => {
	const t = useI18n<typeof resources>();

	const { autofillOptions, onChangeOption, getOptions } = useAddressAutofill({
		form: props.form,
	});

	const autofillCollection = createMemo(() =>
		createListCollection({
			items: autofillOptions(),
		}),
	);
	const onStreetAddressChange = (details: ComboboxInputValueChangeDetails) =>
		getOptions(details.inputValue);
	const onSelectStreetAddress = (details: ComboboxSelectionDetails) =>
		onChangeOption(details.itemValue);

	const statesCollection = createMemo(() =>
		createListCollection({
			items: props.dropdownOptions()?.addressDetailsStateOptions ?? [],
			groupSort: localeAsc,
		}),
	);

	return (
		<>
			<div class="col-span-full">
				<props.Field name="addressDetails.streetAddress">
					{(
						field,
						{ onChange: _onChange, onInput: _onInput, ...rest },
					) => {
						return (
							<>
								<InputGroup>
									<Label>
										{t(
											"form.addressDetails.streetAddress.label",
										)}
									</Label>

									<Combobox
										{...field}
										inputValue={field.value}
										allowCustomValue
										collection={autofillCollection()}
										onInputValueChange={
											onStreetAddressChange
										}
										onSelect={onSelectStreetAddress}>
										<ComboboxTrigger>
											<ComboboxInput {...rest} />

											<ComboboxClearSelection />
										</ComboboxTrigger>

										<ComboboxContent>
											<For
												each={
													autofillCollection().items
												}>
												{item => (
													<ComboboxItem item={item}>
														{formatOption(item)}
													</ComboboxItem>
												)}
											</For>
										</ComboboxContent>
									</Combobox>
								</InputGroup>
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
						{(
							field,
							{ onChange: _onChange, onInput: _onInput, ...rest },
						) => {
							return (
								<>
									<InputGroup>
										<Label>
											{t(
												"form.addressDetails.state.label",
											)}
										</Label>

										<ModularFormsCombobox
											{...field}
											name={field.name}
											form={props.form}
											allowCustomValue
											collection={statesCollection()}
											placeholder={t(
												"form.addressDetails.state.placeholder",
											)}
											disabled={
												!getValue(
													props.form,
													"addressDetails.countryCode",
												)
											}>
											<ComboboxTrigger>
												<ComboboxInput {...rest} />

												<ComboboxClearSelection />
											</ComboboxTrigger>

											<ComboboxContent>
												<For
													each={
														statesCollection().items
													}>
													{item => (
														<ComboboxItem
															item={item}>
															{item}
														</ComboboxItem>
													)}
												</For>
											</ComboboxContent>
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
