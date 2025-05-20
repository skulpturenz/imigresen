import { cva } from "class-variance-authority";
import { styles } from "core/constants/styles";
import { useI18n } from "core/context/i18n";
import { Check, CheckIcon, LoaderCircle } from "lucide-solid";
import {
	createSignal,
	For,
	Index,
	lazy,
	Show,
	type Component,
	type JSXElement,
	type ParentProps,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Portal } from "solid-js/web";
import { Badge } from "ui/badge";
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

	const MobileFooter = () => {
		return (
			<div
				// `isVerySmall`
				class="flex-col sm:hidden space-y-4 mb-4">
				<Button variant="secondary" class="w-full">
					{t("doBack")}
				</Button>

				<Button variant="default" class="w-full">
					{t("doNext")}
				</Button>

				<Button variant="destructive" class="w-full">
					{t("doDelete")}
				</Button>
			</div>
		);
	};

	const DefaultFooter = () => {
		return (
			<div
				// `isSmall` and up
				class="hidden sm:flex justify-between mt-4">
				<div class="flex space-x-2">
					<Button variant="destructive">{t("doDelete")}</Button>
					<Button variant="secondary">{t("doBack")}</Button>
				</div>

				<Button variant="default">{t("doNext")}</Button>
			</div>
		);
	};

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

const AddressDetails = lazy(() =>
	import("./steps/address-details").then(({ AddressDetails }) => ({
		default: AddressDetails,
	})),
);

const ApplicationDetails = lazy(() =>
	import("./steps/application-details").then(({ ApplicationDetails }) => ({
		default: ApplicationDetails,
	})),
);

const Declaration = lazy(() =>
	import("./steps/declaration").then(({ Declaration }) => ({
		default: Declaration,
	})),
);

const PersonalDetails = lazy(() =>
	import("./steps/personal-details").then(({ PersonalDetails }) => ({
		default: PersonalDetails,
	})),
);

const PreviousDocuments = lazy(() =>
	import("./steps/previous-documents").then(({ PreviousDocuments }) => ({
		default: PreviousDocuments,
	})),
);

interface WizardProps {
	Footer?: JSXElement;
}

const Wizard: Component<ParentProps<WizardProps>> = props => {
	const [isProgressFirstItemOnGrid, setIsProgressFirstItemOnGrid] =
		createSignal(true);

	const t = useI18n<typeof resources>();

	const adjustProgressPosition = () => {
		if (styles.breakpoints.isMedium() || styles.breakpoints.isVerySmall()) {
			setIsProgressFirstItemOnGrid(true);

			return;
		}

		const totalWidth = screen.width;
		const spaceOnLeftSide = window.screenLeft;
		const percentageOfSpaceOnLeftSide =
			(spaceOnLeftSide / totalWidth) * 100;

		// first item on grid means progress shows at the top or to the left
		setIsProgressFirstItemOnGrid(percentageOfSpaceOnLeftSide <= 45);
	};

	const resizeObserver = new ResizeObserver(adjustProgressPosition);
	resizeObserver.observe(document.body);

	window.addEventListener("mouseout", adjustProgressPosition);

	const MobileProgress = () => {
		return (
			<Portal>
				<div class="sm:hidden flex justify-center">
					<div
						class={cn(
							"fixed bottom-[env(safe-area-inset-bottom)] bg-background/70 backdrop-blur-sm",
							"text-secondary-foreground w-full p-4 shadow",
						)}>
						<Drawer>
							<DrawerTrigger
								as={Button}
								variant="ghost"
								class="w-full">
								{t("doShowProgressMobile")}
							</DrawerTrigger>
							<DrawerContent class="flex flex-col items-center px-8 my-10 space-y-8">
								<Stepper variant="panel" class="w-full">
									<For each={steps}>
										{(step, idx) => (
											<PanelStep
												status={step.status}
												label={step.id}
												step={idx()}
												href={step.href}
												isLastStep={
													idx() === steps.length - 1
												}
											/>
										)}
									</For>
								</Stepper>

								<Show when={props.Footer}>
									<div class="w-full">{props.Footer}</div>
								</Show>
							</DrawerContent>
						</Drawer>
					</div>
				</div>
			</Portal>
		);
	};

	return (
		<>
			<div class="grid grid-cols-3 md:flex md:gap-12 md:flex-col border border-accent py-8 px-4 md:px-8 mb-24 sm:mb-0">
				<div
					class={cn(
						"col-span-1",
						isProgressFirstItemOnGrid() ? "block" : "hidden",
					)}>
					<Stepper class="hidden sm:block sm:top-[40%] sm:sticky md:static md:top-auto">
						<For each={steps}>
							{step => (
								<SimpleStep
									status={step.status}
									label={step.id}
									description={step.name}
									href={step.href}
								/>
							)}
						</For>
					</Stepper>
				</div>

				<div class="sm:col-span-2 col-span-3 w-full">
					{props.children}
				</div>

				<div
					class={cn(
						"col-span-1",
						!isProgressFirstItemOnGrid() ? "block" : "hidden",
					)}>
					<Stepper class="hidden sm:block sm:top-[40%] sm:sticky md:static md:top-auto">
						<For each={steps}>
							{step => (
								<SimpleStep
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
			</div>

			<Show when={props.Footer}>
				<div class="hidden sm:grid grid-cols-3 md:block">
					<div
						class={cn(
							"col-span-3 sm:col-span-2 sm:col-start-2 md:col-auto",
							isProgressFirstItemOnGrid()
								? "sm:col-start-2"
								: "sm:col-start-auto",
						)}>
						{props.Footer}
					</div>
				</div>
			</Show>

			<MobileProgress />
		</>
	);
};

const stepperVariants = cva("", {
	variants: {
		variant: {
			default: "space-y-4 md:flex md:space-x-8 md:space-y-0",
			panel: "divide-y divide-accent rounded-md border border-accent md:flex md:divide-y-0",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface StepperProps {
	variant?: "default" | "panel";
}

const Stepper: Component<
	JSX.HTMLAttributes<HTMLElement> & StepperProps
> = props => {
	return (
		<nav aria-label="Progress" class={cn(props.class)}>
			<ol
				role="list"
				class={cn(stepperVariants({ variant: props.variant }))}>
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

export const SimpleStep: Component<ParentProps<StepProps>> = props => {
	return (
		<li class="md:flex-1">
			<Show when={props.status === "complete"}>
				<a
					href={props.href}
					onClick={props.onClick}
					class={cn(
						"group flex flex-col transition-colors",
						"py-2 border-muted-foreground hover:border-emerald-500 dark:hover:border-emerald-600",
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
						"group flex flex-col transition-colors py-2 border-accent hover:border-yellow-500 dark:hover:border-yellow-600",
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

export interface PanelStepProps {
	status: "complete" | "current" | "upcoming";
	step: number;
	label: string;
	href?: string;
	onClick?: () => void;
	isLastStep?: boolean;
}

const PanelStep: Component<ParentProps<PanelStepProps>> = props => {
	return (
		<li class="relative md:flex md:flex-1">
			<Show when={props.status === "complete"}>
				<a
					href={props.href}
					class="group flex w-full items-center transition-colors">
					<span class="flex items-center px-6 py-4 text-sm font-medium">
						<span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground group-hover:bg-emerald-500 dark:group-hover:bg-emerald-600">
							<CheckIcon
								aria-hidden="true"
								class="size-6 text-background"
							/>
						</span>
						<span class="ml-4 text-sm font-medium text-foreground">
							{props.label}
						</span>
					</span>
				</a>
			</Show>

			<Show when={props.status === "current"}>
				<a
					href={props.href}
					aria-current="step"
					class="flex items-center px-6 py-4 text-sm font-medium transition-colors">
					<span class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground">
						<span class="text-foreground">{props.step}</span>
					</span>
					<span class="ml-4 text-sm font-medium text-foreground">
						{props.label}
					</span>
				</a>
			</Show>

			<Show
				when={
					props.status !== "complete" && props.status !== "current"
				}>
				<a
					href={props.href}
					class="group flex items-center transition-colors">
					<span class="flex items-center px-6 py-4 text-sm font-medium">
						<span
							class={cn(
								"flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-accent",
								"group-hover:border-yellow-500 dark:group-hover:border-yellow-600",
							)}>
							<span class="text-muted-foreground group-hover:text-foreground">
								{props.step}
							</span>
						</span>
						<span class="ml-4 text-sm font-medium text-muted-foreground group-hover:text-foreground">
							{props.label}
						</span>
					</span>
				</a>
			</Show>

			<Show when={!props.isLastStep}>
				<div
					aria-hidden="true"
					class="absolute right-0 top-0 hidden h-full w-5 md:block">
					<svg
						fill="none"
						viewBox="0 0 22 80"
						preserveAspectRatio="none"
						class="size-full text-accent">
						<path d="M0 -2L20 40L0 82" stroke="currentcolor" />
					</svg>
				</div>
			</Show>
		</li>
	);
};
