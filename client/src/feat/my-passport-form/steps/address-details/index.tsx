import { useI18n } from "core/context/i18n";
import { get, localeAsc } from "core/data/sort";
import { formatOption, useAddressAutofill } from "feat/my-passport-form/hooks";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import type { Option, StepProps } from "feat/my-passport-form/types";
import { InputGroup } from "feat/my-passport-form/ui/input-group";
import { NextRow } from "feat/my-passport-form/ui/next-row";
import { For, type Component } from "solid-js";
import {
	Combobox,
	ComboboxClearSelection,
	ComboboxContent,
	ComboboxErrorMessage,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
	Searchbox,
	type ComboboxInputValueChangeDetails,
	type ComboboxSelectionDetails,
} from "ui/combobox";
import { Label } from "ui/label";
import {
	TextField,
	TextFieldErrorMessage,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export const AddressDetails: Component<StepProps> = props => {
	const t = useI18n<typeof resources>();

	const sortOptionByLabelLocaleAsc = get((item: Option) => item.label)(
		localeAsc,
	);

	const countryOptions = () =>
		toOptions(
			props.dropdownOptions()?.countryOptions ?? Object.create(null),
		).sort(sortOptionByLabelLocaleAsc);

	const { autofillOptions, onChangeOption, getOptions, onClear } =
		useAddressAutofill({
			form: props.form,
			countries: countryOptions,
		});

	const onStreetAddressChange = (details: ComboboxInputValueChangeDetails) =>
		getOptions(details.inputValue);
	const onSelectStreetAddress = (details: ComboboxSelectionDetails) =>
		onChangeOption(details.itemValue);

	return (
		<>
			<div class="col-span-full">
				<props.Field name="addressDetails.streetAddress">
					{(field, fieldProps) => {
						return (
							<>
								<InputGroup>
									<Label>
										{t(
											"form.addressDetails.streetAddress.label",
										)}
									</Label>

									<Searchbox
										{...fieldProps}
										value={field.value}
										options={autofillOptions()}
										onInputValueChange={
											onStreetAddressChange
										}
										onSelect={onSelectStreetAddress}
										onClear={onClear}
										invalid={Boolean(field.error)}>
										<ComboboxTrigger>
											<ComboboxInput>
												<ComboboxClearSelection />
											</ComboboxInput>
										</ComboboxTrigger>

										<ComboboxContent>
											<For each={autofillOptions()}>
												{item => (
													<ComboboxItem item={item}>
														{formatOption(item)}
													</ComboboxItem>
												)}
											</For>
										</ComboboxContent>

										<ComboboxErrorMessage>
											{field.error}
										</ComboboxErrorMessage>
									</Searchbox>
								</InputGroup>
							</>
						);
					}}
				</props.Field>
			</div>
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

								<TextFieldErrorMessage>
									{field.error}
								</TextFieldErrorMessage>
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

									<TextFieldErrorMessage>
										{field.error}
									</TextFieldErrorMessage>
								</TextFieldRoot>
							</>
						)}
					</props.Field>
				</div>

				<div>
					<props.Field name="addressDetails.state">
						{(field, props) => (
							<>
								<TextFieldRoot
									validationState={
										field.error ? "invalid" : "valid"
									}>
									<TextFieldLabel>
										{t("form.addressDetails.state.label")}
									</TextFieldLabel>

									<TextField
										{...props}
										name={field.name}
										value={field.value ?? ""}
										placeholder={t(
											"form.addressDetails.state.placeholder",
										)}
										type="text"
										autocomplete="address-level3"
									/>

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
					<props.Field
						name="addressDetails.countryCode"
						type="string">
						{(field, fieldProps) => (
							<>
								<InputGroup>
									<Label>
										{t(
											"form.addressDetails.countryCode.label",
										)}
									</Label>

									<Combobox
										{...fieldProps}
										value={field.value}
										options={countryOptions()}
										onInput={fieldProps.onInput}
										invalid={Boolean(field.error)}
										itemToValue={item => item.key}
										itemToString={item => item.label}
										placeholder={t(
											"form.addressDetails.countryCode.placeholder",
										)}>
										<ComboboxTrigger>
											<ComboboxInput>
												<ComboboxClearSelection />
											</ComboboxInput>
										</ComboboxTrigger>

										<ComboboxContent>
											{(item: Option<string, string>) => (
												<ComboboxItem item={item}>
													{item.label}
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
			</NextRow>
		</>
	);
};

const toOptions = (x: Record<string, any>) =>
	Object.entries(x).map(([key, value]) => ({ key: key, label: value }));
