import { spreadProps } from "core/utils";
import { type ComponentProps } from "solid-js";
import { cn } from "ui/utils";

export const Table = (props: ComponentProps<"table">) => (
	<div class="relative w-full overflow-x-auto">
		<table
			{...spreadProps(props)}
			class={cn(
				"w-full caption-bottom text-sm text-foreground",
				props.class,
			)}
		/>
	</div>
);

export const TableHeader = (props: ComponentProps<"thead">) => (
	<thead
		{...spreadProps(props)}
		class={cn("[&_tr]:border-b border-border text-foreground", props.class)}
	/>
);

export const TableBody = (props: ComponentProps<"tbody">) => (
	<tbody
		{...spreadProps(props)}
		class={cn("[&_tr:last-child]:border-0 text-foreground", props.class)}
	/>
);

export const TableFooter = (props: ComponentProps<"tfoot">) => (
	<tbody
		{...spreadProps(props)}
		class={cn(
			"bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
			props.class,
		)}
	/>
);

export const TableRow = (props: ComponentProps<"tr">) => (
	<tr
		{...spreadProps(props)}
		class={cn(
			"border-b border-border text-foreground transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
			props.class,
		)}
	/>
);

export const TableHead = (props: ComponentProps<"th">) => (
	<th
		{...spreadProps(props)}
		class={cn(
			"text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap",
			"[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			props.class,
		)}
	/>
);

export const TableCell = (props: ComponentProps<"td">) => (
	<td
		{...spreadProps(props)}
		class={cn(
			"p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			props.class,
		)}
	/>
);

export const TableCaption = (props: ComponentProps<"caption">) => (
	<caption
		{...spreadProps(props)}
		class={cn("mt-4 text-sm text-muted-foreground", props.class)}
	/>
);
