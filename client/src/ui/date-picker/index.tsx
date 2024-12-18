import {
	type DatePickerContentProps,
	type DatePickerControlProps,
	type DatePickerInputProps,
	type DatePickerRangeTextProps,
	type DatePickerRootProps,
	type DatePickerTableCellProps,
	type DatePickerTableCellTriggerProps,
	type DatePickerTableHeaderProps,
	type DatePickerTableProps,
	type DatePickerTableRowProps,
	type DatePickerTriggerProps,
	type DatePickerViewControlProps,
	type DatePickerViewProps,
	type DatePickerViewTriggerProps,
	type DateValue,
	DatePicker as DatePickerPrimitive,
} from "@ark-ui/solid/date-picker";
import { spreadProps } from "core/utils";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-solid";
import type { VoidProps } from "solid-js";
import { buttonVariants } from "ui/button";
import { cn } from "ui/utils";

const resources = {
	viewControlPreviousSrOnly: "Previous",
	viewControlNextSrOnly: "Next",
	triggerSrOnly: "Calendar",
};

export const DatePickerLabel = DatePickerPrimitive.Label;

export const DatePickerTableHead = DatePickerPrimitive.TableHead;

export const DatePickerTableBody = DatePickerPrimitive.TableBody;

export const DatePickerClearTrigger = DatePickerPrimitive.ClearTrigger;

export const DatePickerYearSelect = DatePickerPrimitive.YearSelect;

export const DatePickerMonthSelect = DatePickerPrimitive.MonthSelect;

export const DatePickerContext = DatePickerPrimitive.Context;

export const DatePickerRootProvider = DatePickerPrimitive.RootProvider;

export const DatePickerPositioner = DatePickerPrimitive.Positioner;

export const DatePicker = (props: DatePickerRootProps) => {
	const format = (value: DateValue) => {
		const parsedDate = new Date(Date.parse(value.toString()));

		const normalizedDate = new Date(
			parsedDate.getUTCFullYear(),
			parsedDate.getUTCMonth(),
			parsedDate.getUTCDate(),
		);

		return new Intl.DateTimeFormat("en-US", {
			dateStyle: "long",
		}).format(normalizedDate);
	};

	return <DatePickerPrimitive.Root {...spreadProps(props)} format={format} />;
};

export const DatePickerView = (props: DatePickerViewProps) => (
	<DatePickerPrimitive.View
		{...spreadProps(props)}
		class={cn(
			"space-y-4 min-w-[calc(var(--reference-width)-(0.75rem*2))]",
			props.class,
		)}
	/>
);

export const DatePickerViewControl = (props: DatePickerViewControlProps) => (
	<DatePickerPrimitive.ViewControl
		{...spreadProps(props)}
		class={cn("flex items-center justify-between", props.class)}>
		<DatePickerPrimitive.PrevTrigger
			class={cn(
				buttonVariants({
					variant: "outline",
				}),
				"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
			)}>
			<ChevronLeft class="h-4 w-4">
				<span class="sr-only">
					{resources.viewControlPreviousSrOnly}
				</span>
			</ChevronLeft>
		</DatePickerPrimitive.PrevTrigger>

		{props.children}

		<DatePickerPrimitive.NextTrigger
			class={cn(
				buttonVariants({
					variant: "outline",
				}),
				"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
			)}>
			<ChevronRight class="h-4 w-4">
				<span class="sr-only">{resources.viewControlNextSrOnly}</span>
			</ChevronRight>
		</DatePickerPrimitive.NextTrigger>
	</DatePickerPrimitive.ViewControl>
);

export const DatePickerRangeText = (
	props: VoidProps<DatePickerRangeTextProps>,
) => (
	<DatePickerPrimitive.RangeText
		{...spreadProps(props)}
		class={cn("text-sm font-medium", props.class)}
	/>
);

export const DatePickerTable = (props: DatePickerTableProps) => (
	<DatePickerPrimitive.Table
		{...spreadProps(props)}
		class={cn("w-full border-collapse space-y-1", props.class)}
	/>
);

export const DatePickerTableRow = (props: DatePickerTableRowProps) => (
	<DatePickerPrimitive.TableRow
		{...spreadProps(props)}
		class={cn("mt-2 flex w-full", props.class)}
	/>
);

export const DatePickerTableHeader = (props: DatePickerTableHeaderProps) => (
	<DatePickerPrimitive.TableHeader
		{...spreadProps(props)}
		class={cn(
			"w-8 flex-1 text-[0.8rem] font-normal text-muted-foreground",
			props.class,
		)}
	/>
);

export const DatePickerTableCell = (props: DatePickerTableCellProps) => (
	<DatePickerPrimitive.TableCell
		{...spreadProps(props)}
		class={cn(
			"flex-1 p-0 text-center text-sm",
			"has-[[data-in-range]]:bg-accent has-[[data-in-range]]:first-of-type:rounded-l-md has-[[data-in-range]]:last-of-type:rounded-r-md",
			"has-[[data-range-end]]:rounded-r-md has-[[data-range-start]]:rounded-l-md",
			"has-[[data-outside-range][data-in-range]]:bg-accent/50",
			props.class,
		)}
	/>
);

export const DatePickerTableCellTrigger = (
	props: DatePickerTableCellTriggerProps,
) => (
	<DatePickerPrimitive.TableCellTrigger
		{...spreadProps(props)}
		class={cn(
			buttonVariants({ variant: "ghost" }),
			"size-8 w-full p-0 font-normal data-[selected]:opacity-100",
			"data-[today]:bg-accent data-[today]:text-accent-foreground",
			"[&:is([data-today][data-selected])]:bg-primary [&:is([data-today][data-selected])]:text-primary-foreground",
			"data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary",
			"data-[selected]:hover:text-primary-foreground",
			"data-[disabled]:text-muted-foreground data-[disabled]:opacity-50",
			"data-[outside-range]:text-muted-foreground data-[outside-range]:opacity-50",
			"[&:is([data-outside-range][data-in-range])]:bg-accent/50 [&:is([data-outside-range][data-in-range])]:text-muted-foreground",
			"[&:is([data-outside-range][data-in-range])]:opacity-30",
			props.class,
		)}
	/>
);

export const DatePickerViewTrigger = (props: DatePickerViewTriggerProps) => (
	<DatePickerPrimitive.ViewTrigger
		{...spreadProps(props)}
		class={cn(
			buttonVariants({ variant: "ghost" }),
			"h-7 mx-2",
			props.class,
		)}
	/>
);

export const DatePickerContent = (props: DatePickerContentProps) => (
	<DatePickerPrimitive.Content
		{...spreadProps(props)}
		class={cn(
			"rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none",
			"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
			"data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50",
			props.class,
		)}>
		{props.children}
	</DatePickerPrimitive.Content>
);

export const DatePickerControl = (props: DatePickerControlProps) => (
	<DatePickerPrimitive.Control
		{...spreadProps(props)}
		class={cn(
			"inline-flex items-center gap-x-1 [&>input:first-of-type]:rounded-s-md",
			props.class,
		)}
	/>
);

export const DatePickerInput = (props: DatePickerInputProps) => (
	<DatePickerPrimitive.Input
		{...spreadProps(props)}
		class={cn(
			"w-full h-9 border border-border focus:border-border bg-background px-3 py-1 text-sm shadow-sm",
			"placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
			"focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
			props.class,
		)}
	/>
);

export const DatePickerTrigger = (props: DatePickerTriggerProps) => (
	<DatePickerPrimitive.Trigger
		{...spreadProps(props)}
		class={cn(
			"transition-[box-shadow,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
			"focus-visible:ring-ring flex items-center justify-center min-w-9 min-h-9 rounded-e-md border",
			"border-border bg-background text-foreground [&>svg]:size-4 hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
			props.class,
		)}>
		<CalendarDays class="h-4 w-4">
			<span class="sr-only">{resources.triggerSrOnly}</span>
		</CalendarDays>
	</DatePickerPrimitive.Trigger>
);
