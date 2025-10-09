import {
	createListCollection as arkCreateListCollection,
	Combobox as ComboboxPrimitive,
	type ComboboxValueChangeDetails,
} from "@ark-ui/solid/combobox";
import { spreadProps } from "core/utils";
import { Check, ChevronsDownUp, X } from "lucide-solid";
import {
	children,
	createEffect,
	createSignal,
	createUniqueId,
	For,
	splitProps,
	type Component,
	type JSX,
	type ParentProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "ui/utils";

export const resources = {
	triggerSrOnly: "Expand",
	itemCheckedSrOnly: "Selected",
};

export type {
	ComboboxInputValueChangeDetails,
	ComboboxSelectionDetails,
} from "@ark-ui/solid/combobox";

export const createListCollection = arkCreateListCollection;

// TODO: add a story with multiple combobox
export interface ComboboxProps<TCollection extends string | Record<string, any>>
	extends Omit<
			ComboboxPrimitive.RootProps<TCollection>,
			"value" | "onBlur" | "onChange" | "ref" | "onInput"
		>,
		Pick<
			JSX.SelectHTMLAttributes<HTMLSelectElement>,
			"ref" | "onInput" | "onChange" | "onBlur"
		> {
	value?: string | string[];
}

export const Combobox = <TCollection extends string | Record<string, any>>(
	props: ComboboxProps<TCollection>,
) => {
	const [selectProps, others] = splitProps(props, [
		"ref",
		"onInput",
		"onChange",
		"onBlur",
		"name",
	]);
	const getValue = (props: ComboboxProps<TCollection>) => {
		if (!props.value) {
			return [];
		}

		if (Array.isArray(props.value)) {
			return props.value;
		}

		return [props.value];
	};
	const [value, setValue] = createSignal<string[]>(getValue(props));

	// if `value` changes then we want to keep our local version in sync
	// but because we don't trigger `onValueChange` we don't end up dispatching
	// a change event. otherwise we're gonna run into loops where the value
	// changes from outside which causes us to update our copy and dispatch an event
	// which causes value to change again (array) and so on and so forth
	createEffect(() => {
		setValue(getValue(props));
	});

	let selectRef: HTMLSelectElement;
	const onValueChange = (details: ComboboxValueChangeDetails) => {
		setValue(details.value);

		selectRef?.dispatchEvent(new Event("input", { bubbles: true }));
		props.onValueChange?.(details);
	};

	const hiddenSelectId = createUniqueId();

	const ref = (ref: HTMLSelectElement) => {
		props.ref = ref;
		selectRef = ref;
	};

	const onChangeHiddenSelect: JSX.ChangeEventHandlerUnion<
		HTMLSelectElement,
		Event
	> = event => {
		if (typeof props.onChange !== "function") {
			return;
		}

		const values = value();
		if (values.length !== 1) {
			event.target.value = "";
		} else {
			event.target.value = values.at(0) ?? "";
		}

		props.onChange(event);
	};

	const onClickHiddenSelect = () => {
		const buttonElement = document.querySelector<HTMLButtonElement>(
			`div:has(+ #${hiddenSelectId}) > button`,
		);
		const inputElement = document.querySelector<HTMLInputElement>(
			`div:has(+ #${hiddenSelectId}) > button > input`,
		);

		buttonElement?.click();
		inputElement?.focus();
	};

	const onFocusHiddenSelect = () => {
		const inputElement = document.querySelector<HTMLInputElement>(
			`div:has(+ #${hiddenSelectId}) > button > input`,
		);

		inputElement?.focus();
	};

	const onBlurHiddenSelect = () => {
		const inputElement = document.querySelector<HTMLInputElement>(
			`div:has(+ #${hiddenSelectId}) > button > input`,
		);

		inputElement?.blur();
	};

	return (
		<ComboboxPrimitive.Root
			{...others}
			value={value()}
			onValueChange={onValueChange}>
			{props.children}

			<select
				{...selectProps}
				id={hiddenSelectId}
				ref={ref}
				onChange={onChangeHiddenSelect}
				multiple={props.multiple}
				onClick={onClickHiddenSelect} // because ref is attached to this
				onFocus={onFocusHiddenSelect} // because ref is attached to this
				onBlur={onBlurHiddenSelect} // because ref is attached to this
				class="absolute opacity-0">
				<For each={value()}>
					{value => {
						return (
							<option value={value} selected={props.multiple}>
								{value}
							</option>
						);
					}}
				</For>
			</select>
		</ComboboxPrimitive.Root>
	);
};

export const ComboboxItemGroup = ComboboxPrimitive.ItemGroup;

export const ComboxboxItemGroupLabel = (
	props: ComboboxPrimitive.ItemGroupLabelProps,
) => (
	<ComboboxPrimitive.ItemGroupLabel
		{...spreadProps(props)}
		class={cn("text-sm font-bold py-1.5 pr-2 pl-8", props.class)}>
		{props.children}
	</ComboboxPrimitive.ItemGroupLabel>
);

export const ComboboxInput = (props: ComboboxPrimitive.InputProps) => (
	<ComboboxPrimitive.Input
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"h-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none",
			"border-0 focus:border-0 focus:shadow-none focus:ring-0",
			"disabled:cursor-not-allowed disabled:opacity-50 w-full",
			props.class,
		)}
	/>
);

export const ComboboxTrigger = (props: ComboboxPrimitive.TriggerProps) => (
	<ComboboxPrimitive.Control>
		<ComboboxPrimitive.Trigger
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
		</ComboboxPrimitive.Trigger>
	</ComboboxPrimitive.Control>
);

export const ComboboxContent = (props: ComboboxPrimitive.ContentProps) => {
	const getChildren = children(() => props.children);

	return (
		<Portal>
			<ComboboxPrimitive.Positioner>
				<ComboboxPrimitive.Content
					{...spreadProps(props)}
					ref={props.ref}
					class={cn(
						"relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground",
						'shadow-md data-[state="open"]:animate-in data-[state="closed"]:animate-out data-[state="closed"]:fade-out-0',
						'data-[state="open"]:fade-in-0 data-[state="closed"]:zoom-out-95 data-[state="open"]:zoom-in-95',
						"max-h-[50vh] overflow-scroll",
						(getChildren() as unknown[]).length > 0
							? "visible"
							: "hidden",
						props.class,
					)}>
					<div class="p-1">{props.children}</div>
				</ComboboxPrimitive.Content>
			</ComboboxPrimitive.Positioner>
		</Portal>
	);
};

export const ComboboxItem = (props: ComboboxPrimitive.ItemProps) => (
	<ComboboxPrimitive.Item
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"relative h-10 flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8",
			"text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent",
			"data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
			props.class,
		)}>
		<ComboboxPrimitive.ItemIndicator
			class={cn(
				"absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-foreground",
				"data-[highlighted]:text-accent-foreground",
			)}>
			<Check class="h-4 w-4">
				<span class="sr-only">{resources.itemCheckedSrOnly}</span>
			</Check>
		</ComboboxPrimitive.ItemIndicator>

		<ComboboxPrimitive.ItemText>
			{props.children}
		</ComboboxPrimitive.ItemText>
	</ComboboxPrimitive.Item>
);

export const ComboboxClearSelection: Component<
	ParentProps<ComboboxPrimitive.ClearTriggerProps>
> = props => {
	return (
		<ComboboxPrimitive.ClearTrigger
			{...spreadProps(props)}
			class={cn(
				"absolute right-8 top-[30%] cursor-pointer",
				"focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus:outline-none",
				"focus-visible:ring-offset-background",
				props.class,
			)}>
			<X class="size-4 p-0.5 text-muted-foreground transition hover:text-foreground" />
		</ComboboxPrimitive.ClearTrigger>
	);
};
