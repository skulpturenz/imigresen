import {
	type ComboboxContentProps,
	type ComboboxInputProps,
	type ComboboxItemProps,
	type ComboboxTriggerProps,
	Combobox as ComboboxPrimitive,
} from "@kobalte/core/combobox";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { spreadProps } from "core/utils";
import { Check, ChevronsDownUp } from "lucide-solid";
import type { ParentProps, ValidComponent } from "solid-js";
import { cn } from "ui/utils";

export const resources = {
	triggerSrOnly: "Expand",
	itemCheckedSrOnly: "Selected",
};

export const Combobox = ComboboxPrimitive;

export const ComboboxDescription = ComboboxPrimitive.Description;

export const ComboboxErrorMessage = ComboboxPrimitive.ErrorMessage;

export const ComboboxItemDescription = ComboboxPrimitive.ItemDescription;

export const ComboboxHiddenSelect = ComboboxPrimitive.HiddenSelect;

export const ComboboxInput = <T extends ValidComponent = "input">(
	props: PolymorphicProps<T, ComboboxInputProps<T>>,
) => (
	<ComboboxPrimitive.Input
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"h-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none",
			"disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:border-0 focus:shadow-none focus:ring-0",
			props.class,
		)}
	/>
);

export const ComboboxTrigger = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, ComboboxTriggerProps<T>>,
) => (
	<ComboboxPrimitive.Control>
		<ComboboxPrimitive.Trigger
			{...spreadProps(props)}
			ref={props.ref}
			class={cn(
				"flex h-9 w-full items-center justify-between rounded-md border border-input px-3 shadow-sm has-[:focus-visible]:ring-2",
				"has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 transition-shadow has-[:focus-visible]:ring-offset-background",
				props.class,
			)}>
			{props.children}
			<ComboboxPrimitive.Icon class="flex h-3.5 w-3.5 items-center justify-center text-foreground">
				<ChevronsDownUp class="h-4 w-4 opacity-50">
					<span class="sr-only">{resources.triggerSrOnly}</span>
				</ChevronsDownUp>
			</ComboboxPrimitive.Icon>
		</ComboboxPrimitive.Trigger>
	</ComboboxPrimitive.Control>
);

export const ComboboxContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, ComboboxContentProps<T>>,
) => (
	<ComboboxPrimitive.Portal>
		<ComboboxPrimitive.Content
			{...spreadProps(props)}
			ref={props.ref}
			class={cn(
				"relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground",
				"shadow-md data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0",
				"data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
				"origin-[--kb-combobox-content-transform-origin]",
				props.class,
			)}>
			<ComboboxPrimitive.Listbox class="p-1" />
		</ComboboxPrimitive.Content>
	</ComboboxPrimitive.Portal>
);

export const ComboboxItem = <T extends ValidComponent = "li">(
	props: PolymorphicProps<T, ComboboxItemProps<T>>,
) => (
	<ComboboxPrimitive.Item
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8",
			"text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent",
			"data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
			props.class,
		)}>
		<ComboboxPrimitive.ItemIndicator class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-foreground">
			<Check class="h-4 w-4">
				<span class="sr-only">{resources.itemCheckedSrOnly}</span>
			</Check>
		</ComboboxPrimitive.ItemIndicator>
		<ComboboxPrimitive.ItemLabel>
			{props.children as ParentProps["children"]}
		</ComboboxPrimitive.ItemLabel>
	</ComboboxPrimitive.Item>
);
