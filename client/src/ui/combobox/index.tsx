import {
	Combobox as ComboboxPrimitive,
	type ComboboxContentProps,
	type ComboboxInputProps,
	type ComboboxItemProps,
	type ComboboxRootProps,
	type ComboboxTriggerProps,
} from "@kobalte/core/combobox";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { Check, ChevronsUpDown, X } from "lucide-solid";
import {
	createSignal,
	splitProps,
	type Component,
	type JSX,
	type ParentProps,
	type ValidComponent,
	type VoidProps,
} from "solid-js";
import { cn } from "ui/utils";

export const ComboboxHiddenSelect = ComboboxPrimitive.HiddenSelect;

export type ComboboxProps<
	Option,
	OptGroup = never,
	T extends ValidComponent = "div",
> = Omit<
	ComboboxRootProps<Option, OptGroup, T>,
	"ref" | "onInput" | "onChange" | "onBlur"
> &
	Pick<
		JSX.SelectHTMLAttributes<HTMLSelectElement>,
		"ref" | "onInput" | "onChange" | "onBlur"
	>;

export const Combobox = <
	Option,
	OptGroup = never,
	T extends ValidComponent = "div",
>(
	props: PolymorphicProps<T, ComboboxProps<Option, OptGroup, T>>,
) => {
	const [value, setValue] = createSignal(props.value);
	const [comboboxProps, others] = splitProps(props, [
		"ref",
		"onInput",
		"onChange",
		"onBlur",
	]);

	return (
		<ComboboxPrimitive {...others} value={value()} onChange={setValue}>
			{props.children}

			<ComboboxHiddenSelect {...comboboxProps} />
		</ComboboxPrimitive>
	);
};

export const ComboboxDescription = ComboboxPrimitive.Description;
export const ComboboxErrorMessage = ComboboxPrimitive.ErrorMessage;
export const ComboboxItemDescription = ComboboxPrimitive.ItemDescription;

type comboboxInputProps<T extends ValidComponent = "input"> = VoidProps<
	ComboboxInputProps<T> & {
		class?: string;
	}
>;

export const ComboboxInput = <T extends ValidComponent = "input">(
	props: PolymorphicProps<T, comboboxInputProps<T>>,
) => {
	const [local, rest] = splitProps(props as comboboxInputProps, ["class"]);

	return (
		<ComboboxPrimitive.Input
			class={cn(
				"h-full bg-transparent text-sm placeholder:text-muted-foreground",
				"focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
				"border-0 focus:ring-0",
				local.class,
			)}
			{...rest}
		/>
	);
};

type comboboxTriggerProps<T extends ValidComponent = "button"> = ParentProps<
	ComboboxTriggerProps<T> & {
		class?: string;
	}
>;

export const ComboboxTrigger = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, comboboxTriggerProps<T>>,
) => {
	const [local, rest] = splitProps(props as comboboxTriggerProps, [
		"class",
		"children",
	]);

	return (
		<ComboboxPrimitive.Control>
			<ComboboxPrimitive.Trigger
				class={cn(
					"flex h-9 w-full items-center justify-between rounded-md border border-input px-3 shadow-sm",
					"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:outline-none ring-offset-background",
					local.class,
				)}
				{...rest}>
				{local.children}
				<ComboboxPrimitive.Icon class="flex h-3.5 w-3.5 items-center justify-center">
					<ChevronsUpDown class="size-4 opacity-50" />
				</ComboboxPrimitive.Icon>
			</ComboboxPrimitive.Trigger>
		</ComboboxPrimitive.Control>
	);
};

type comboboxContentProps<T extends ValidComponent = "div"> =
	ComboboxContentProps<T> & {
		class?: string;
	};

export const ComboboxContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, comboboxContentProps<T>>,
) => {
	const [local, rest] = splitProps(props as comboboxContentProps, ["class"]);

	return (
		<ComboboxPrimitive.Portal>
			<ComboboxPrimitive.Content
				class={cn(
					"relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover",
					"text-popover-foreground shadow-md data-[expanded]:animate-in",
					"data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0",
					"data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
					"origin-[--kb-combobox-content-transform-origin]",
					local.class,
				)}
				{...rest}>
				<ComboboxPrimitive.Listbox class="p-1" />
			</ComboboxPrimitive.Content>
		</ComboboxPrimitive.Portal>
	);
};

type comboboxItemProps<T extends ValidComponent = "li"> = ParentProps<
	ComboboxItemProps<T> & {
		class?: string;
	}
>;

export const ComboboxItem = <T extends ValidComponent = "li">(
	props: PolymorphicProps<T, comboboxItemProps<T>>,
) => {
	const [local, rest] = splitProps(props as comboboxItemProps, [
		"class",
		"children",
	]);

	return (
		<ComboboxPrimitive.Item
			class={cn(
				"relative flex w-full cursor-default select-none items-center rounded-sm",
				"py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none",
				"data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
				"data-[disabled]:opacity-50",
				local.class,
			)}
			{...rest}>
			<ComboboxPrimitive.ItemIndicator class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
				<Check class="size-4" />
			</ComboboxPrimitive.ItemIndicator>
			<ComboboxPrimitive.ItemLabel>
				{local.children}
			</ComboboxPrimitive.ItemLabel>
		</ComboboxPrimitive.Item>
	);
};

export interface ComboboxClearSelectionProps {
	onClear: () => void;
}

export const ComboboxClearSelection: Component<
	ComboboxClearSelectionProps
> = props => {
	const onPointerDown = (event: MouseEvent) => {
		event.stopImmediatePropagation();
	};

	return (
		<button
			class={cn(
				"absolute right-8 top-[30%] bg-muted cursor-pointer",
				"focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
				"focus:outline-none focus-visible:ring-offset-background",
			)}
			onPointerDown={onPointerDown}
			onClick={props.onClear}
			tabIndex={0}>
			<X class="size-4 p-0.5 text-muted-foreground transition hover:text-foreground" />
		</button>
	);
};
