import {
	Combobox as ArkCombobox,
	createListCollection as arkCreateListCollection,
} from "@ark-ui/solid/combobox";
import { spreadProps } from "core/utils";
import { Check, ChevronsDownUp, X } from "lucide-solid";
import type { Component, ParentProps } from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "ui/utils";

export const resources = {
	triggerSrOnly: "Expand",
	itemCheckedSrOnly: "Selected",
};

export type { ComboboxInputValueChangeDetails } from "@ark-ui/solid/combobox";

export const createListCollection = arkCreateListCollection;

export const Combobox = ArkCombobox.Root;

export const ComboboxItemGroup = ArkCombobox.ItemGroup;

export const ComboxboxItemGroupLabel = (
	props: ArkCombobox.ItemGroupLabelProps,
) => (
	<ArkCombobox.ItemGroupLabel
		{...spreadProps(props)}
		class={cn("text-sm font-bold py-1.5 pr-2 pl-8", props.class)}>
		{props.children}
	</ArkCombobox.ItemGroupLabel>
);

export const ComboboxInput = (props: ArkCombobox.InputProps) => (
	<ArkCombobox.Input
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"h-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none",
			"border-0 focus:border-0 focus:shadow-none focus:ring-0",
			"disabled:cursor-not-allowed disabled:opacity-50",
			props.class,
		)}
	/>
);

export const ComboboxTrigger = (props: ArkCombobox.TriggerProps) => (
	<ArkCombobox.Control>
		<ArkCombobox.Trigger
			{...spreadProps(props)}
			ref={props.ref}
			class={cn(
				"relative flex h-10 w-full items-center justify-between rounded-md border border-input px-3 has-[:focus-visible]:ring-2",
				"has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 transition has-[:focus-visible]:ring-offset-background",
				"disabled:cursor-not-allowed disabled:opacity-50",
				props.class,
			)}>
			{props.children}

			<div class="flex h-3.5 w-3.5 items-center justify-center text-muted-foreground">
				<ChevronsDownUp class="h-4 w-4">
					<span class="sr-only">{resources.triggerSrOnly}</span>
				</ChevronsDownUp>
			</div>
		</ArkCombobox.Trigger>
	</ArkCombobox.Control>
);

export const ComboboxContent = (props: ArkCombobox.ContentProps) => (
	<Portal>
		<ArkCombobox.Positioner>
			<ArkCombobox.Content
				{...spreadProps(props)}
				ref={props.ref}
				class={cn(
					"relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground",
					'shadow-md data-[state="open"]:animate-in data-[state="closed"]:animate-out data-[state="closed"]:fade-out-0',
					'data-[state="open"]:fade-in-0 data-[state="closed"]:zoom-out-95 data-[state="open"]:zoom-in-95',
					"origin-[--kb-combobox-content-transform-origin]",
					"max-h-[50vh] overflow-scroll",
					props.class,
				)}>
				<div class="p-1">{props.children}</div>
			</ArkCombobox.Content>
		</ArkCombobox.Positioner>
	</Portal>
);

export const ComboboxItem = (props: ArkCombobox.ItemProps) => (
	<ArkCombobox.Item
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"relative h-10 flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8",
			"text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent",
			"data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
			props.class,
		)}>
		<ArkCombobox.ItemIndicator
			class={cn(
				"absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-foreground",
				"data-[highlighted]:text-accent-foreground",
			)}>
			<Check class="h-4 w-4">
				<span class="sr-only">{resources.itemCheckedSrOnly}</span>
			</Check>
		</ArkCombobox.ItemIndicator>

		<ArkCombobox.ItemText>{props.children}</ArkCombobox.ItemText>
	</ArkCombobox.Item>
);

export const ComboboxClearSelection: Component<
	ParentProps<ArkCombobox.ClearTriggerProps>
> = props => {
	return (
		<ArkCombobox.ClearTrigger
			{...spreadProps(props)}
			class={cn(
				"absolute right-8 top-[30%] cursor-pointer",
				"focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus:outline-none",
				"focus-visible:ring-offset-background",
				props.class,
			)}>
			<X class="size-4 p-0.5 text-muted-foreground transition hover:text-foreground" />
		</ArkCombobox.ClearTrigger>
	);
};
