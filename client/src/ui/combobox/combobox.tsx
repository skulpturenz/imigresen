import {
	createListCollection as arkCreateListCollection,
	Combobox as ComboboxPrimitive,
	useListCollection,
	type CollectionItem,
	type ComboboxInputValueChangeDetails,
	type ComboboxValueChangeDetails,
	type ListCollection,
	type UseListCollectionProps,
} from "@ark-ui/solid/combobox";
import { spreadProps } from "core/utils";
import { flow, identity, invariant, isPlainObject } from "es-toolkit";
import { Check, ChevronsDownUp, X } from "lucide-solid";
import {
	children,
	createContext,
	createEffect,
	createSignal,
	createUniqueId,
	For,
	Show,
	splitProps,
	useContext,
	type Accessor,
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

export interface ComboboxBaseProps<TCollectionItem>
	extends Omit<
			ComboboxPrimitive.RootProps<CollectionItem>,
			| "value"
			| "onBlur"
			| "onChange"
			| "ref"
			| "onInput"
			| "collection"
			| "onInputValueChange"
			| "inputValue"
		>,
		Pick<
			JSX.SelectHTMLAttributes<HTMLSelectElement>,
			"ref" | "onInput" | "onChange" | "onBlur"
		>,
		Omit<UseListCollectionProps<TCollectionItem>, "initialItems"> {
	options: TCollectionItem[];
	value?: string | string[];
}

export interface ComboboxStandardValueProps<TCollectionItem>
	extends ComboboxBaseProps<TCollectionItem> {
	allowCustomValue?: never | false;
}

export interface ComboboxCustomValueProps<TCollectionItem>
	extends ComboboxBaseProps<TCollectionItem> {
	allowCustomValue: true;
	customValueKey?: string;
	toOption?: (value: string) => TCollectionItem;
	toLabel?: (value: TCollectionItem) => string;
	onCreateCustomValue?: (inputValue: string) => void | Promise<void>;
}

export type ComboboxProps<TCollectionItem> =
	| ComboboxStandardValueProps<TCollectionItem>
	| ComboboxCustomValueProps<TCollectionItem>;

interface ComboboxContext<TCollectionItem = any> {
	collection: Accessor<ListCollection<TCollectionItem>>;
	isNewOptionValue: (inputValue: string) => boolean;
	itemToString: (item: TCollectionItem) => string;
}
const ComboboxContext = createContext<ComboboxContext | null>(null);

export const Combobox = <TCollectionItem,>(
	props: ComboboxProps<TCollectionItem>,
) => {
	const [selectProps, listCollectionProps, others] = splitProps(
		props,
		["ref", "onInput", "onChange", "onBlur", "name"],
		[
			"options",
			"filter",
			"limit",
			"groupBy",
			"groupSort",
			"itemToValue",
			"itemToString",
			"isItemDisabled",
		],
	);

	const NEW_ITEM_VALUE =
		props.allowCustomValue && props.customValueKey
			? props.customValueKey
			: `combobox-custom-item:${createUniqueId()}`;
	const [options, setOptions] = createSignal(
		listCollectionProps.options ?? [],
	);

	const itemToValue = (item: TCollectionItem) => {
		if (props.itemToValue) {
			return props.itemToValue(item);
		}

		if (isPlainObject(item)) {
			invariant(
				item.value,
				"Specify a custom `itemToValue`, see: https://ark-ui.com/docs/collections/list-collection",
			);

			return item.value;
		}

		return item;
	};
	const itemToString = (item: TCollectionItem) => {
		if (props.itemToString) {
			return props.itemToString(item);
		}

		if (isPlainObject(item)) {
			invariant(
				item.label,
				"Specify a custom `itemToString`, see: https://ark-ui.com/docs/collections/list-collection",
			);

			return item.label;
		}

		return item;
	};
	const listCollection = useListCollection({
		...listCollectionProps,
		initialItems: options(),
	});

	createEffect(() => {
		listCollection.set(options());
	});

	const getValue = (props: ComboboxProps<TCollectionItem>) => {
		if (!props.value) {
			return [];
		}

		if (Array.isArray(props.value)) {
			return props.value;
		}

		return [props.value];
	};
	const [value, setValue] = createSignal<string[]>(getValue(props));
	const [inputValue, setInputValue] = createSignal<string>("");

	// if `value` changes then we want to keep our local version in sync
	// but because we don't trigger `onValueChange` we don't end up dispatching
	// a change event. otherwise we're gonna run into loops where the value
	// changes from outside which causes us to update our copy and dispatch an event
	// which causes value to change again (array) and so on and so forth
	createEffect(() => {
		setValue(getValue(props));
	});

	const isNewOptionValue = (inputValue: string) => {
		if (!inputValue.trim()) {
			return false;
		}

		return !options().some(option => itemToString(option) === inputValue);
	};

	const getExistingNewOptionValue = () => {
		const existingNewOptionValue = listCollection
			.collection()
			.items.find(value => {
				return isNewOptionValue(itemToValue(value));
			});

		return existingNewOptionValue;
	};

	let selectRef: HTMLSelectElement;
	const onValueChange = (details: ComboboxValueChangeDetails) => {
		if (props.allowCustomValue && details.value.some(isNewOptionValue)) {
			// allow for refetching new list of options and setting appropriately
			// only one custom value at a time
			props.onCreateCustomValue?.(
				itemToValue(
					details.value.find(isNewOptionValue) as TCollectionItem,
				),
			);

			setOptions(listCollection.collection().items);
		}

		setValue(details.value);

		selectRef?.dispatchEvent(new Event("input", { bubbles: true }));
		props.onValueChange?.(details);
	};

	const onInputValueChange = (details: ComboboxInputValueChangeDetails) => {
		const initialInputValue = inputValue();
		setInputValue(details.inputValue);

		if (!props.allowCustomValue) {
			return;
		}

		if (!["input-change", "item-select"].includes(details.reason ?? "")) {
			return;
		}

		if (isNewOptionValue(details.inputValue)) {
			const existingNewOptionValue = getExistingNewOptionValue();

			if (existingNewOptionValue) {
				listCollection.update(
					itemToValue(existingNewOptionValue),
					(props.toOption?.(details.inputValue) ??
						details.inputValue) as TCollectionItem,
				);
			} else {
				const toOption = props.toOption ?? identity<any>;
				// with objects the key of the `item` has to be `NEW_ITEM_VALUE`
				// https://ark-ui.com/docs/components/combobox#creatable-options
				listCollection.upsert(
					NEW_ITEM_VALUE,
					toOption(details.inputValue),
				);
			}
		} else if (!details.inputValue.trim()) {
			const existingNewOptionValue = getExistingNewOptionValue();

			listCollection.remove(existingNewOptionValue as TCollectionItem);
		}
		// when custom value is allowed and the custom value changes to an existing value we
		// want to remove the custom value that we added before
		else if (
			!isNewOptionValue(details.inputValue) &&
			details.reason === "input-change"
		) {
			listCollection.remove(initialInputValue);
		}

		listCollection.filter(details.inputValue);
	};

	const hiddenSelectId = `combobox-hidden-select:${createUniqueId()}`;

	const ref = (ref: HTMLSelectElement) => {
		props.ref = ref;
		selectRef = ref;
	};

	const COMBOBOX_TRIGGER_SELECTOR = `div:has(+ [id="${hiddenSelectId}"])`;

	const onClickHiddenSelect = () => {
		const buttonElement = document.querySelector<HTMLButtonElement>(
			`${COMBOBOX_TRIGGER_SELECTOR} > button`,
		);
		const inputElement = document.querySelector<HTMLInputElement>(
			`${COMBOBOX_TRIGGER_SELECTOR} > button > input`,
		);

		buttonElement?.click();
		inputElement?.focus();
	};

	const onFocusHiddenSelect = () => {
		const inputElement = document.querySelector<HTMLInputElement>(
			`${COMBOBOX_TRIGGER_SELECTOR} > button > input`,
		);

		inputElement?.focus();
	};

	const onBlurHiddenSelect = () => {
		const inputElement = document.querySelector<HTMLInputElement>(
			`${COMBOBOX_TRIGGER_SELECTOR} > button > input`,
		);

		inputElement?.blur();
	};

	const onInteractOutside = (...args: any[]) => {
		/// @ts-expect-error: ark doesn't export `InteractOutsideEvent`
		props.onInteractOutside?.(...args);

		const isSelectedOption = value().some(
			value =>
				itemToValue(
					listCollection
						.collection()
						.find(inputValue()) as TCollectionItem,
				) === value,
		);

		// in the case of multiple selections, we want to reset the input value to blank if:
		// - its not a new option
		// - the input value is an existing option but the selected options don't include it
		//   - changing the input value does not select the option
		if (
			(!isNewOptionValue(inputValue()) || !isSelectedOption) &&
			value().length > 1
		) {
			setInputValue("");
		}

		// in the case of single selection, we want to reset it to the selected option if:
		// - its not a new option value (has not been created yet)
		// - the input value is an existing option but the selected option is different
		//   - changing the input value does not select the option
		if (!isNewOptionValue(inputValue()) && isSelectedOption) {
			return;
		}

		const newInputValue = value().length
			? itemToString(
					listCollection
						.collection()
						.find(value().at(0)) as TCollectionItem,
				)
			: "";

		setInputValue(newInputValue);
	};

	return (
		<ComboboxContext.Provider
			value={{
				collection: listCollection.collection,
				isNewOptionValue,
				itemToString,
			}}>
			<ComboboxPrimitive.Root
				{...others}
				collection={listCollection.collection()}
				value={value()}
				inputValue={inputValue()}
				onValueChange={onValueChange}
				onInputValueChange={onInputValueChange}
				onInteractOutside={onInteractOutside}>
				{props.children}

				<select
					{...selectProps}
					id={hiddenSelectId}
					ref={ref}
					multiple={props.multiple}
					onClick={onClickHiddenSelect} // because ref is attached to this
					onFocus={onFocusHiddenSelect} // because ref is attached to this
					onBlur={onBlurHiddenSelect} // because ref is attached to this
					class="absolute opacity-0 pointer-events-none">
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
		</ComboboxContext.Provider>
	);
};

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

export interface ComboboxContentProps<
	TCollectionItem = any,
	U extends JSX.Element = JSX.Element,
> extends Omit<ComboboxPrimitive.ContentProps, "children"> {
	fallback?: JSX.Element;
	children:
		| ((
				item: TCollectionItem,
				isNewOptionValue: (item: TCollectionItem) => boolean,
				index: Accessor<number>,
		  ) => U)
		| JSX.Element;
}

export const ComboboxContent = <
	TCollectionItem = unknown,
	U extends JSX.Element = JSX.Element,
>(
	props: ComboboxContentProps<TCollectionItem, U>,
) => {
	const comboboxContext = useContext(ComboboxContext);

	const isHidden = () => {
		if (comboboxContext) {
			return (
				!comboboxContext.collection().items.length && !props.fallback
			);
		}

		const resolved = children(() => props.children as JSX.Element);

		return !resolved.toArray().length;
	};

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
						isHidden() ? "hidden" : "visible",
						props.class,
					)}>
					<div class="p-1">
						<Show when={comboboxContext}>
							<For
								fallback={props.fallback}
								each={comboboxContext?.collection().items}>
								{(item, idx) => {
									invariant(
										comboboxContext,
										"Must be used within a ComboboxContext",
									);

									invariant(
										typeof props.children === "function",
										"ComboboxContent used within a context without a render function as `children`",
									);

									return (
										<>
											{props.children(
												item,
												flow(
													comboboxContext.itemToString,
													comboboxContext.isNewOptionValue,
												),
												idx,
											)}
										</>
									);
								}}
							</For>
						</Show>

						<Show when={!comboboxContext}>
							{props.children as unknown as JSX.Element}
						</Show>
					</div>
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
