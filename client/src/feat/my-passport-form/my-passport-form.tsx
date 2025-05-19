import { styles } from "core/constants/styles";
import { useI18n } from "core/context/i18n";
import {
	createSignal,
	For,
	Index,
	Show,
	type Component,
	type ParentProps,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Portal } from "solid-js/web";
import { Button } from "ui/button";
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
import { Drawer, DrawerContent, DrawerTrigger } from "ui/drawer";
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
	TextFieldErrorMessage,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";
import { Typography } from "ui/typography";
import { cn } from "ui/utils";
import type { resources } from "./resources/i18n/en-US";

const steps = [
	{
		id: "Step 1",
		name: "Application details",
		href: "#",
		status: "complete",
	},
	{ id: "Step 2", name: "Personal details", href: "#", status: "current" },
	{ id: "Step 3", name: "Address details", href: "#", status: "upcoming" },
	{ id: "Step 4", name: "Previous documents", href: "#", status: "upcoming" },
	{ id: "Step 5", name: "Declaration", href: "#", status: "upcoming" },
] as const;

export const MyPassportForm = () => {
	const [isProgressOnRight, setIsProgressOnRight] = createSignal(true);

	const adjustProgressPosition = () => {
		if (styles.breakpoints.isMd() || styles.breakpoints.isVerySmall()) {
			setIsProgressOnRight(false);

			return;
		}

		const totalWidth = screen.width;
		const spaceOnLeftSide = window.screenLeft;
		const percentageOfSpaceOnLeftSide =
			(spaceOnLeftSide / totalWidth) * 100;

		setIsProgressOnRight(percentageOfSpaceOnLeftSide <= 45);
	};

	const resizeObserver = new ResizeObserver(adjustProgressPosition);
	resizeObserver.observe(document.body);

	window.addEventListener("mouseout", adjustProgressPosition);

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

	const MobileProgress = () => {
		return (
			<Portal>
				<div class="sm:hidden flex justify-center">
					<div
						class={cn(
							"fixed bottom-[env(safe-area-inset-bottom)] bg-popover/50 backdrop-blur-sm",
							"text-secondary-foreground w-full p-4 border-accent border-t",
						)}>
						<div>
							<Drawer>
								<DrawerTrigger
									as={Button}
									variant="ghost"
									class="w-full">
									{t("doShowProgressMobile")}
								</DrawerTrigger>
								<DrawerContent class="flex items-center">
									<Stepper class="my-10">
										<For each={steps}>
											{step => (
												<Step
													status={step.status}
													label={step.id}
													description={step.name}
													href={step.href}
												/>
											)}
										</For>
									</Stepper>
								</DrawerContent>
							</Drawer>
						</div>
					</div>
				</div>
			</Portal>
		);
	};

	return (
		<>
			<div class="grid grid-cols-3 md:flex md:gap-12 md:flex-col border border-accent py-8 px-4 md:px-8 mb-32">
				<Show when={!isProgressOnRight()}>
					<div class="sm:col-span-1 md:col-span-1">
						<Stepper class="hidden sm:block sm:top-[40%] sm:sticky md:static md:top-auto">
							<For each={steps}>
								{step => (
									<Step
										status={step.status}
										label={step.id}
										description={step.name}
										href={step.href}
									/>
								)}
							</For>
						</Stepper>
					</div>
				</Show>

				<div class="col-span-3 sm:col-span-2 md:col-span-1 w-full">
					<form>
						<ApplicationDetails />

						<PersonalDetails />

						<AddressDetails />
					</form>
				</div>

				<Show when={isProgressOnRight()}>
					<div class="sm:col-span-1 md:col-span-1">
						<Stepper class="hidden sm:block sm:top-[40%] sm:sticky md:static md:top-auto">
							<For each={steps}>
								{step => (
									<Step
										status={step.status}
										label={step.id}
										description={step.name}
										href={step.href}
										invertIndicator
									/>
								)}
							</For>
						</Stepper>
					</div>
				</Show>
			</div>

			<MobileProgress />
		</>
	);
};

const Stepper: Component<JSX.HTMLAttributes<HTMLElement>> = props => {
	return (
		<nav aria-label="Progress" class={cn(props.class)}>
			<ol role="list" class="space-y-4 md:flex md:space-x-8 md:space-y-0">
				{props.children}
			</ol>
		</nav>
	);
};

export interface StepProps {
	status: "complete" | "current" | "upcoming";
	label?: string;
	description?: string;
	href?: string;
	onClick?: () => void;
	invertIndicator?: boolean;
}

export const Step: Component<ParentProps<StepProps>> = props => {
	return (
		<li class="md:flex-1">
			<Show when={props.status === "complete"}>
				<a
					href={props.href}
					onClick={props.onClick}
					class={cn(
						"group flex flex-col transition-colors",
						"py-2 border-muted-foreground hover:border-foreground",
						props.invertIndicator
							? "border-r-4 md:border-r-0 md:border-t-4 pr-4 md:pt-4 md:pb-0 md:pr-0 text-right md:text-left"
							: "border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pt-4 pl-4 md:pl-0 text-left",
					)}>
					<Show when={props.label}>
						<Typography
							variant="small"
							as="span"
							class="leading-normal text-muted-foreground group-hover:text-foreground">
							{props.label}
						</Typography>
					</Show>
					<Show when={props.description}>
						<Typography
							variant="small"
							as="span"
							class="text-muted-foreground group-hover:text-foreground">
							{props.description}
						</Typography>
					</Show>
				</a>
			</Show>
			<Show when={props.status === "current"}>
				<a
					href={props.href}
					onClick={props.onClick}
					aria-current="step"
					class={cn(
						"flex flex-col py-2 transition-colors border-foreground",
						props.invertIndicator
							? "border-r-4 md:border-r-0 md:border-t-4 pr-4 md:pt-4 md:pb-0 md:pr-0 text-right md:text-left"
							: "border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pt-4 pl-4 md:pl-0 text-left",
					)}>
					<Show when={props.label}>
						<Typography
							variant="small"
							as="span"
							class="leading-normal">
							{props.label}
						</Typography>
					</Show>
					<Show when={props.description}>
						<Typography variant="small" as="span">
							{props.description}
						</Typography>
					</Show>
				</a>
			</Show>
			<Show
				when={
					props.status !== "complete" && props.status !== "current"
				}>
				<a
					href={props.href}
					onClick={props.onClick}
					class={cn(
						"group flex flex-col transition-colors py-2 border-accent hover:border-foreground",
						props.invertIndicator
							? "border-r-4 md:border-r-0 md:border-t-4 pr-4 md:pt-4 md:pb-0 md:pr-0 text-right md:text-left"
							: "border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pt-4 pl-4 md:pl-0 text-left",
					)}>
					<Show when={props.label}>
						<Typography
							variant="small"
							as="span"
							class="leading-normal text-muted-foreground group-hover:text-foreground">
							{props.label}
						</Typography>
					</Show>
					<Show when={props.description}>
						<Typography
							variant="small"
							as="span"
							class="text-muted-foreground group-hover:text-foreground">
							{props.description}
						</Typography>
					</Show>
				</a>
			</Show>
		</li>
	);
};
