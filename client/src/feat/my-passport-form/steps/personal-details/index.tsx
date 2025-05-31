import {
	parseDate,
	type DatePickerValueChangeDetails,
} from "@ark-ui/solid/date-picker";
import { getValue, setValue, type FieldEvent } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import { invariant, partial } from "es-toolkit";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import { type StepProps } from "feat/my-passport-form/types";
import { X } from "lucide-solid";
import { Index, Show, type Component } from "solid-js";
import { Portal } from "solid-js/web";
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
} from "ui/combobox";
import {
	DatePicker,
	DatePickerContent,
	DatePickerContext,
	DatePickerControl,
	DatePickerInput,
	DatePickerPositioner,
	DatePickerRangeText,
	DatePickerTable,
	DatePickerTableBody,
	DatePickerTableCell,
	DatePickerTableCellTrigger,
	DatePickerTableHead,
	DatePickerTableHeader,
	DatePickerTableRow,
	DatePickerTrigger,
	DatePickerView,
	DatePickerViewControl,
	DatePickerViewTrigger,
} from "ui/date-picker";
import { Label } from "ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "ui/select";
import {
	TextField,
	TextFieldDescription,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";
import { cn } from "ui/utils";

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

								<SelectGender
									{...fieldProps}
									name={field.name}
									value={field.value}
									// TODO: unsure why `onChange` isn't working
									// think its because it does not emit an event
									onChange={partial(
										setValue,
										props.form,
										"personalDetails.genderCode",
									)}
									placeholder={t(
										"form.personalDetails.genderCode.placeholder",
									)}
								/>
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

								<SelectRelationshipStatus
									{...fieldProps}
									name={field.name}
									value={field.value}
									// TODO: unsure why `onChange` isn't working
									// think its because it does not emit an event
									onChange={partial(
										setValue,
										props.form,
										"personalDetails.relationshipStatusCode",
									)}
									placeholder={t(
										"form.personalDetails.relationshipStatusCode.placeholder",
									)}
								/>
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
												),
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
												),
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

									<InputDate
										{...fieldProps}
										value={field.value}
										onChange={partial(
											setValue,
											props.form,
											"personalDetails.dateOfBirth",
										)}
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
						<InputGroup>
							<Label>
								{t(
									"form.personalDetails.countryOfBirthCode.label",
								)}
							</Label>

							<SelectCountry
								{...fieldProps}
								name={field.name}
								value={field.value}
								// TODO: unsure why `onChange` isn't working
								// think its because it does not emit an event
								onChange={partial(
									setValue,
									props.form,
									"personalDetails.countryOfBirthCode",
								)}
								placeholder={t(
									"form.personalDetails.countryOfBirthCode.placeholder",
								)}
							/>
						</InputGroup>
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

								<StateOfBirth
									{...fieldProps}
									value={field.value}
									onChange={partial(
										setValue,
										props.form,
										"personalDetails.stateOfBirth",
									)}
									placeholder={t(
										"form.personalDetails.stateOfBirth.placeholder",
									)}
								/>
							</InputGroup>
						</Show>
					</>
				)}
			</props.Field>
		</>
	);
};

const InputGroup = (props: any) => (
	<div class="flex flex-col space-y-4">{props.children}</div>
);

// TODO
const StateOfBirth = (props: any) => {
	return (
		<Combobox
			options={["Next.js", "Astro", "Qwik", "SolidStart", "Nuxt.js"]}
			placeholder={props.placeholder}
			value={props.value}
			onChange={props.onChange}
			itemComponent={props => (
				<ComboboxItem item={props.item}>
					{props.item.rawValue}
				</ComboboxItem>
			)}>
			<Combobox.Control>
				{state => {
					const onPointerDown = (event: MouseEvent) => {
						event.stopImmediatePropagation();
					};

					return (
						<>
							<ComboboxTrigger class="relative">
								<ComboboxInput />

								<Show when={props.value}>
									<button
										class={cn(
											"absolute right-8 top-[30%] bg-muted cursor-pointer",
											"focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus:outline-none",
										)}
										onPointerDown={onPointerDown}
										onClick={state.clear}>
										<X class="size-4 p-0.5 text-muted-foreground transition hover:text-foreground" />
									</button>
								</Show>
							</ComboboxTrigger>
						</>
					);
				}}
			</Combobox.Control>
			<ComboboxContent />
		</Combobox>
	);
};

const InputDate = (props: any) => {
	const onChange = (details?: DatePickerValueChangeDetails) => {
		if (!details?.valueAsString.length) {
			props.onChange(null);

			return;
		}

		const selectedDate = details.valueAsString.at(0);

		invariant(selectedDate, "Selected date is not specified");

		props.onChange?.(new Date(selectedDate));
	};

	const getValue = () => {
		if (!props.value || !(props.value instanceof Date)) {
			return;
		}

		return [parseDate(props.value)];
	};

	return (
		<DatePicker value={getValue()} onValueChange={onChange}>
			<DatePickerControl class="w-full">
				<DatePickerInput placeholder={props.placeholder} />
				<DatePickerTrigger />
			</DatePickerControl>
			<Portal>
				<DatePickerPositioner>
					<DatePickerContent>
						<DatePickerView view="day">
							<DatePickerContext>
								{context => (
									<>
										<DatePickerViewControl>
											<DatePickerViewTrigger>
												<DatePickerRangeText />
											</DatePickerViewTrigger>
										</DatePickerViewControl>
										<DatePickerTable>
											<DatePickerTableHead>
												<DatePickerTableRow>
													<Index
														each={
															context().weekDays
														}>
														{weekDay => (
															<DatePickerTableHeader>
																{
																	weekDay()
																		.short
																}
															</DatePickerTableHeader>
														)}
													</Index>
												</DatePickerTableRow>
											</DatePickerTableHead>
											<DatePickerTableBody>
												<Index each={context().weeks}>
													{week => (
														<DatePickerTableRow>
															<Index
																each={week()}>
																{day => (
																	<DatePickerTableCell
																		value={day()}>
																		<DatePickerTableCellTrigger>
																			{
																				day()
																					.day
																			}
																		</DatePickerTableCellTrigger>
																	</DatePickerTableCell>
																)}
															</Index>
														</DatePickerTableRow>
													)}
												</Index>
											</DatePickerTableBody>
										</DatePickerTable>
									</>
								)}
							</DatePickerContext>
						</DatePickerView>
						<DatePickerView view="month">
							<DatePickerContext>
								{context => (
									<>
										<DatePickerViewControl>
											<DatePickerViewTrigger>
												<DatePickerRangeText />
											</DatePickerViewTrigger>
										</DatePickerViewControl>
										<DatePickerTable>
											<DatePickerTableBody>
												<Index
													each={context().getMonthsGrid(
														{
															columns: 4,
															format: "short",
														},
													)}>
													{months => (
														<DatePickerTableRow>
															<Index
																each={months()}>
																{month => (
																	<DatePickerTableCell
																		value={
																			month()
																				.value
																		}>
																		<DatePickerTableCellTrigger>
																			{
																				month()
																					.label
																			}
																		</DatePickerTableCellTrigger>
																	</DatePickerTableCell>
																)}
															</Index>
														</DatePickerTableRow>
													)}
												</Index>
											</DatePickerTableBody>
										</DatePickerTable>
									</>
								)}
							</DatePickerContext>
						</DatePickerView>
						<DatePickerView view="year">
							<DatePickerContext>
								{context => (
									<>
										<DatePickerViewControl>
											<DatePickerViewTrigger>
												<DatePickerRangeText />
											</DatePickerViewTrigger>
										</DatePickerViewControl>
										<DatePickerTable>
											<DatePickerTableBody>
												<Index
													each={context().getYearsGrid(
														{
															columns: 4,
														},
													)}>
													{years => (
														<DatePickerTableRow>
															<Index
																each={years()}>
																{year => (
																	<DatePickerTableCell
																		value={
																			year()
																				.value
																		}>
																		<DatePickerTableCellTrigger>
																			{
																				year()
																					.label
																			}
																		</DatePickerTableCellTrigger>
																	</DatePickerTableCell>
																)}
															</Index>
														</DatePickerTableRow>
													)}
												</Index>
											</DatePickerTableBody>
										</DatePickerTable>
									</>
								)}
							</DatePickerContext>
						</DatePickerView>
					</DatePickerContent>
				</DatePickerPositioner>
			</Portal>
		</DatePicker>
	);
};

const SelectRelationshipStatus = (props: any) => {
	return (
		<Select
			value={props.value ?? null}
			options={["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]}
			placeholder={props.placeholder}
			onChange={props.onChange}
			itemComponent={props => (
				<SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
			)}>
			<Select.HiddenSelect />
			<SelectTrigger class="w-full relative">
				<SelectValue<string>>
					{state => {
						const onPointerDown = (event: MouseEvent) => {
							event.stopImmediatePropagation();
						};

						return (
							<>
								<div>{state.selectedOption()} </div>

								<button
									class={cn(
										"absolute right-8 top-[30%] bg-muted cursor-pointer",
										"focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus:outline-none",
									)}
									onPointerDown={onPointerDown}
									onClick={state.clear}>
									<X class="size-4 p-0.5 text-muted-foreground transition hover:text-foreground" />
								</button>
							</>
						);
					}}
				</SelectValue>
			</SelectTrigger>
			<SelectContent />
		</Select>
	);
};

const SelectGender = (props: any) => {
	return (
		<Select
			value={props.value ?? null}
			options={["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]}
			placeholder={props.placeholder}
			onChange={props.onChange}
			itemComponent={props => (
				<SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
			)}>
			<Select.HiddenSelect />
			<SelectTrigger class="w-full relative">
				<SelectValue<string>>
					{state => {
						const onPointerDown = (event: MouseEvent) => {
							event.stopImmediatePropagation();
						};

						return (
							<>
								<div>{state.selectedOption()} </div>

								<button
									class={cn(
										"absolute right-8 top-[30%] bg-muted cursor-pointer",
										"focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus:outline-none",
									)}
									onPointerDown={onPointerDown}
									onClick={state.clear}>
									<X class="size-4 p-0.5 text-muted-foreground transition hover:text-foreground" />
								</button>
							</>
						);
					}}
				</SelectValue>
			</SelectTrigger>
			<SelectContent />
		</Select>
	);
};

const SelectCountry = (props: any) => {
	return (
		<Select
			value={props.value ?? null}
			options={["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]}
			placeholder={props.placeholder}
			onChange={props.onChange}
			itemComponent={props => (
				<SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
			)}>
			<Select.HiddenSelect />
			<SelectTrigger class="w-full relative">
				<SelectValue<string>>
					{state => {
						const onPointerDown = (event: MouseEvent) => {
							event.stopImmediatePropagation();
						};

						return (
							<>
								<div>{state.selectedOption()} </div>

								<button
									class={cn(
										"absolute right-8 top-[30%] bg-muted cursor-pointer",
										"focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus:outline-none",
									)}
									onPointerDown={onPointerDown}
									onClick={state.clear}>
									<X class="size-4 p-0.5 text-muted-foreground transition hover:text-foreground" />
								</button>
							</>
						);
					}}
				</SelectValue>
			</SelectTrigger>
			<SelectContent />
		</Select>
	);
};

// TODO
const NextRow = (props: any) => (
	<div class="col-span-full">
		<div
			// TODO: base grid config
			class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
			{props.children}
		</div>
	</div>
);

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
