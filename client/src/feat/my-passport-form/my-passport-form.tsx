import { useI18n } from "core/context/i18n";
import { Check, LoaderCircle } from "lucide-solid";
import { createSignal, Index, lazy, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { Badge } from "ui/badge";
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
import { StepStatus } from "ui/stepper/types.ts";
import {
	TextField,
	TextFieldDescription,
	TextFieldErrorMessage,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";
import type { resources } from "./resources/i18n/en-US";
import { DefaultFooter, MobileFooter } from "./ui/footer";
import { Wizard } from "./ui/wizard";
import type { WizardStep } from "./ui/wizard/types.ts";

export const MyPassportForm = () => {
	// TODO
	const [peristStatus, _setPersistStatus] = createSignal<
		"persisted" | "persisting" | null
	>("persisting");

	const t = useI18n<typeof resources>();

	const ApplicationDetails = () => {
		return (
			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
				<div>
					<Label>{t("form.documentType.label")}</Label>

					<Select
						class="mt-4"
						options={[
							"Apple",
							"Banana",
							"Blueberry",
							"Grapes",
							"Pineapple",
						]}
						placeholder={t("form.documentType.placeholder")}
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
					</Select>
				</div>

				<div class="space-y-2">
					<Label>Request type</Label>
					<Select
						class="mt-4"
						options={[
							"Apple",
							"Banana",
							"Blueberry",
							"Grapes",
							"Pineapple",
						]}
						placeholder="Select a fruit…"
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
					</Select>
				</div>

				<div class="col-span-full">
					<TextFieldRoot>
						<TextFieldLabel>Identity card number</TextFieldLabel>
						<TextField type="email" placeholder="Email" />
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>

				<div class="col-span-full">
					<TextFieldRoot>
						<TextFieldLabel>
							Birth certificate number
						</TextFieldLabel>
						<TextField type="email" placeholder="Email" />
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>
			</div>
		);
	};

	const PersonalDetails = () => {
		return (
			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
				<div class="col-span-full">
					<TextFieldRoot class="space-y-2" validationState="invalid">
						<TextFieldLabel>First name</TextFieldLabel>

						<TextField
							class="mt-2"
							type="email"
							placeholder="Email"
						/>
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>

				<div class="col-span-full">
					<TextFieldRoot>
						<TextFieldLabel>Last name</TextFieldLabel>
						<TextField type="email" placeholder="Email" />
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>

				<div>
					<TextFieldRoot>
						<TextFieldLabel>Phone number</TextFieldLabel>
						<TextField type="email" placeholder="Email" />
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>

				<div>
					<TextFieldRoot>
						<TextFieldLabel>Email address</TextFieldLabel>
						<TextField type="email" placeholder="Email" />
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>

				<div>
					<Label>Date of birth</Label>

					<DatePicker>
						<DatePickerControl class="w-full">
							<DatePickerInput placeholder="MM/DD/YYYY" />
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
																		context()
																			.weekDays
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
															<Index
																each={
																	context()
																		.weeks
																}>
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
				</div>

				<div>
					<Label>Nationality</Label>
					<Select
						options={[
							"Apple",
							"Banana",
							"Blueberry",
							"Grapes",
							"Pineapple",
						]}
						placeholder="Select a fruit…"
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
					</Select>
				</div>

				<div class="col-span-1">
					<Label>Gender</Label>
					<Select
						options={[
							"Apple",
							"Banana",
							"Blueberry",
							"Grapes",
							"Pineapple",
						]}
						placeholder="Select a fruit…"
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
					</Select>
				</div>

				<div>
					<TextFieldRoot>
						<TextFieldLabel>Height</TextFieldLabel>
						<TextField type="email" placeholder="Email" />
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>

				<div>
					<Label>Maritial status</Label>
					<Select
						options={[
							"Apple",
							"Banana",
							"Blueberry",
							"Grapes",
							"Pineapple",
						]}
						placeholder="Select a fruit…"
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
					</Select>
				</div>
			</div>
		);
	};

	const AddressDetails = () => {
		return (
			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
				<div class="col-span-full">
					<TextFieldRoot>
						<TextFieldLabel>Street address</TextFieldLabel>
						<TextField type="email" placeholder="Email" />
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>

				<div>
					<TextFieldRoot>
						<TextFieldLabel>City</TextFieldLabel>
						<TextField type="email" placeholder="Email" />
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>

				<div>
					<TextFieldRoot>
						<TextFieldLabel>State</TextFieldLabel>
						<TextField type="email" placeholder="Email" />
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>

				<div>
					<TextFieldRoot>
						<TextFieldLabel>Postcode</TextFieldLabel>
						<TextField type="email" placeholder="Email" />
						<TextFieldDescription>
							Enter a valid email
						</TextFieldDescription>
						<TextFieldErrorMessage>
							Email is required.
						</TextFieldErrorMessage>
					</TextFieldRoot>
				</div>

				<div>
					<Label>Country</Label>
					<Select
						options={[
							"Apple",
							"Banana",
							"Blueberry",
							"Grapes",
							"Pineapple",
						]}
						placeholder="Select a fruit…"
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
					</Select>
				</div>
			</div>
		);
	};

	const steps: WizardStep[] = [
		{
			hash: "applicationDetails",
			status: StepStatus.Complete,
			label: "Step 1",
			description: "Application details",
		},
		{
			hash: "personalDetails",
			status: StepStatus.Current,
			label: "Step 2",
			description: "Personal details",
		},
		{
			hash: "addressDetails",
			status: StepStatus.Upcoming,
			label: "Step 3",
			description: "Address details",
		},
		{
			hash: "previousDocuments",
			status: StepStatus.Upcoming,
			label: "Step 4",
			description: "Previous document",
		},
		{
			hash: "declaration",
			status: StepStatus.Upcoming,
			label: "Step 5",
			description: "Declaration",
		},
	];

	return (
		<>
			<Show when={peristStatus()}>
				<div class="flex flex-col mb-4">
					<Show when={peristStatus() === "persisted"}>
						<Badge
							variant="outline"
							class="self-end items-center flex gap-2">
							<Check class="size-4" />
							{t("isPersisted")}
						</Badge>
					</Show>

					<Show when={peristStatus() === "persisting"}>
						<Badge class="self-end flex gap-2 items-center">
							<LoaderCircle
								// TODO: the icon is not centred
								class="size-4 animate-spin"
							/>
							{t("isPersisting")}
						</Badge>
					</Show>
				</div>
			</Show>

			<Wizard
				steps={steps}
				Footer={
					<>
						<DefaultFooter />

						<MobileFooter />
					</>
				}>
				<form>
					<ApplicationDetails />

					<PersonalDetails />

					<AddressDetails />
				</form>
			</Wizard>
		</>
	);
};

const _AddressDetails = lazy(() =>
	import("./steps/address-details").then(({ AddressDetails }) => ({
		default: AddressDetails,
	})),
);

const _ApplicationDetails = lazy(() =>
	import("./steps/application-details").then(({ ApplicationDetails }) => ({
		default: ApplicationDetails,
	})),
);

const _Declaration = lazy(() =>
	import("./steps/declaration").then(({ Declaration }) => ({
		default: Declaration,
	})),
);

const _PersonalDetails = lazy(() =>
	import("./steps/personal-details").then(({ PersonalDetails }) => ({
		default: PersonalDetails,
	})),
);

const _PreviousDocuments = lazy(() =>
	import("./steps/previous-documents").then(({ PreviousDocuments }) => ({
		default: PreviousDocuments,
	})),
);
