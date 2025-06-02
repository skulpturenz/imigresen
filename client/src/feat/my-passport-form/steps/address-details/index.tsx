import {
	Combobox as ArkCombobox,
	createListCollection as arkCreateListCollection,
} from "@ark-ui/solid/combobox";
import { getValue } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import { formatOption, useAddressAutofill } from "feat/my-passport-form/hooks";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import type { MyPassportForm, StepProps } from "feat/my-passport-form/types";
import { AutocorrectTextField } from "feat/my-passport-form/ui/autocorrect-text-field";
import { InputGroup } from "feat/my-passport-form/ui/input-group";
import { NextRow } from "feat/my-passport-form/ui/next-row";
import { localeAsc } from "feat/my-passport-form/utils/sort";
import { createMemo, For, type Component } from "solid-js";
import { Portal } from "solid-js/web";
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

	// https://ark-ui.com/docs/components/combobox
	const collection = createMemo(() =>
		arkCreateListCollection({ items: autofillOptions() }),
	);

	return (
		<>
			<div class="col-span-full">
				<props.Field name="addressDetails.streetAddress">
					{(field, fieldProps) => {
						// TODO: can't just compare street address
						const findAddressOption = (value?: string) =>
							autofillOptions().find(
								addressOption =>
									addressOption.streetAddress === value,
							);

						// TODO: we want options to show when loaded, doesn't at the moment
						// TODO: clear is not working

						return (
							<>
								<InputGroup>
									<Label>
										{t(
											"form.addressDetails.streetAddress.label",
										)}
									</Label>

									<ArkCombobox.Root
										collection={collection()}
										onInputValueChange={details =>
											getOptions(
												details.inputValue.toString(),
											)
										}>
										<ArkCombobox.Label>
											Framework
										</ArkCombobox.Label>
										<ArkCombobox.Control>
											<ArkCombobox.Input class="bg-background text-foreground" />
											<ArkCombobox.Trigger>
												Open
											</ArkCombobox.Trigger>
											<ArkCombobox.ClearTrigger>
												Clear
											</ArkCombobox.ClearTrigger>
										</ArkCombobox.Control>
										<Portal>
											<ArkCombobox.Positioner>
												<ArkCombobox.Content>
													<ArkCombobox.ItemGroup>
														<ArkCombobox.ItemGroupLabel>
															Frameworks
														</ArkCombobox.ItemGroupLabel>
														<For
															each={
																collection()
																	.items
															}>
															{item => (
																<ArkCombobox.Item
																	item={item}>
																	<ArkCombobox.ItemText>
																		{
																			item.streetAddress
																		}
																	</ArkCombobox.ItemText>
																	<ArkCombobox.ItemIndicator>
																		✓
																	</ArkCombobox.ItemIndicator>
																</ArkCombobox.Item>
															)}
														</For>
													</ArkCombobox.ItemGroup>
												</ArkCombobox.Content>
											</ArkCombobox.Positioner>
										</Portal>
									</ArkCombobox.Root>

									<Combobox
										{...field}
										{...fieldProps}
										/// @ts-expect-error: TODO
										ref={fieldProps.ref}
										noResetInputOnBlur
										value={findAddressOption(field.value)}
										options={autofillOptions()}
										optionValue={formatOption}
										optionLabel={state =>
											state.streetAddress ?? ""
										}
										onChange={onChangeOption}
										onInputChange={getOptions}
										placeholder={t(
											"form.addressDetails.streetAddress.placeholder",
										)}
										itemComponent={props => (
											<ComboboxItem item={props.item}>
												{formatOption(
													props.item.rawValue,
												)}
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
