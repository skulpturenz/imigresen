import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type {
	SelectContentProps,
	SelectItemProps,
	SelectTriggerProps,
} from "@kobalte/core/select";
import { Select as SelectPrimitive } from "@kobalte/core/select";
import { spreadProps } from "core/utils";
import { Check, ChevronDown } from "lucide-solid";
import type { ParentProps, ValidComponent } from "solid-js";
import { cn } from "ui/utils";

const resources = {
	srOnlyCheckbox: "Checkbox",
	srOnlyShowOptions: "Show options",
};

export const Select = SelectPrimitive;

export const SelectValue = SelectPrimitive.Value;

export const SelectDescription = SelectPrimitive.Description;

export const SelectErrorMessage = SelectPrimitive.ErrorMessage;

export const SelectItemDescription = SelectPrimitive.ItemDescription;

export const SelectHiddenSelect = SelectPrimitive.HiddenSelect;

export const SelectSection = SelectPrimitive.Section;

export const SelectTrigger = <T extends ValidComponent = "button">(
	props: ParentProps<PolymorphicProps<T, SelectTriggerProps<T>>>,
) => (
	<SelectPrimitive.Trigger
		{...spreadProps(props)}
		class={cn(
			"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background",
			"px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none",
			"focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed",
			"disabled:opacity-50 [&>span]:line-clamp-1 transition-shadow",
			props.class,
		)}>
		{props.children}

		<SelectPrimitive.Icon as={ChevronDown} class="h-4 w-4 opacity-50">
			<span class="sr-only">{resources.srOnlyShowOptions}</span>
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
);

export const SelectContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, SelectContentProps<T>>,
) => (
	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			{...spreadProps(props)}
			class={cn(
				"relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground",
				"shadow-md data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0",
				"data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
				props.class,
			)}>
			<SelectPrimitive.Listbox class="p-1 focus-visible:outline-none" />
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
);

export const SelectItem = <T extends ValidComponent = "li">(
	props: ParentProps<PolymorphicProps<T, SelectItemProps<T>>>,
) => (
	<SelectPrimitive.Item
		{...spreadProps(props)}
		class={cn(
			"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5",
			"pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			props.class,
		)}>
		<SelectPrimitive.ItemIndicator class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<Check class="h-4 w-4" />
			<span class="sr-only">{resources.srOnlyCheckbox}</span>
		</SelectPrimitive.ItemIndicator>

		<SelectPrimitive.ItemLabel>{props.children}</SelectPrimitive.ItemLabel>
	</SelectPrimitive.Item>
);
