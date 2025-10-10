import {
	Combobox as ComboboxPrimitive,
	useListCollection,
	type CollectionItem,
	type ComboboxInputValueChangeDetails,
	type ComboboxValueChangeDetails,
	type UseListCollectionProps,
} from "@ark-ui/solid/combobox";
import { invariant, isPlainObject, uniqBy } from "es-toolkit";
import {
	createEffect,
	createSignal,
	createUniqueId,
	splitProps,
	type JSX,
} from "solid-js";

export interface SearchboxProps<TCollectionItem>
	extends Omit<
			ComboboxPrimitive.RootProps<CollectionItem>,
			| "value"
			| "onBlur"
			| "onChange"
			| "ref"
			| "onInput"
			| "collection"
			| "inputValue"
			| "allowCustomValue"
			| "onValueChange"
		>,
		Pick<
			JSX.InputHTMLAttributes<HTMLInputElement>,
			"ref" | "onInput" | "onChange" | "onBlur"
		>,
		Omit<
			UseListCollectionProps<TCollectionItem>,
			| "initialItems"
			| "filter"
			| "limit"
			| "groupBy"
			| "groupSort"
			| "isItemDisabled"
		> {
	options: TCollectionItem[];
	value?: string;
	onClear?: () => void;
}

// The main differences between `Searchbox` and `Combobox` are:
// - we use a hidden input instead of hidden select
// - how new option values are determined
//   - we look at `props.options` instead of an internal copy of `options`
//   - with `Combobox` every time we add a new option it gets added to `options`.
//     the main thing is that we have to select a new option for it to get added,
//     with `Searchbox` we add a new option whenever the input value changes
// - changing the input value will unselect any selected option
//   - there can be multiple locations with the same street address so we can't just match
//     by street address
export const Searchbox = <TCollectionItem,>(
	props: SearchboxProps<TCollectionItem>,
) => {
	const [hiddenInputProps, listCollectionProps, others] = splitProps(
		props,
		["ref", "onInput", "onChange", "onBlur", "name"],
		["options", "itemToValue", "itemToString"],
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
	const getValue = (props: SearchboxProps<TCollectionItem>) => {
		if (!props.value) {
			return [];
		}

		if (Array.isArray(props.value)) {
			return props.value;
		}

		return [props.value];
	};

	const NEW_ITEM_VALUE = `combobox-custom-item:${createUniqueId()}`;
	const listCollection = useListCollection({
		...listCollectionProps,
		initialItems: listCollectionProps.options,
		// custom comparison
		// because the selected option can either be a custom search string
		// or a valid item from `props.options`
		// compared to `Combobox` where when a custom option is selected we
		// `toOption` it so it's a homogenous collection
		itemToString,
		itemToValue,
	});

	const [value, setValue] = createSignal<string[]>(getValue(props));
	const [inputValue, setInputValue] = createSignal<string>(props.value ?? "");

	createEffect(() => {
		setInputValue(props.value ?? "");
		setValue(getValue(props));
	});

	const isNewOptionValue = (inputValue: string) => {
		if (!inputValue.trim()) {
			return false;
		}

		return !props.options.some(
			option => itemToString(option) === inputValue,
		);
	};

	const getExistingNewOptionValue = () => {
		const existingNewOptionValue = listCollection
			.collection()
			.items.find(value => {
				return isNewOptionValue(itemToValue(value));
			});

		return existingNewOptionValue;
	};

	let inputRef: HTMLInputElement;

	const onValueChange = (details: ComboboxValueChangeDetails) => {
		const newOptions = uniqBy(
			[...props.options, ...listCollection.collection().items],
			itemToValue,
		);

		listCollection.set(newOptions);
		setValue(details.value);
	};

	const onInputValueChange = (details: ComboboxInputValueChangeDetails) => {
		const initialInputValue = inputValue();
		setInputValue(details.inputValue);

		if (
			!["input-change", "item-select", "clear-trigger"].includes(
				details.reason ?? "",
			)
		) {
			return;
		}

		if (isNewOptionValue(details.inputValue)) {
			const existingNewOptionValue = getExistingNewOptionValue();

			if (existingNewOptionValue) {
				listCollection.update(
					itemToValue(existingNewOptionValue),
					details.inputValue as TCollectionItem,
				);
			} else {
				listCollection.upsert(
					NEW_ITEM_VALUE,
					details.inputValue as TCollectionItem,
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

		props.onInputValueChange?.(details);
		inputRef?.dispatchEvent(new Event("input", { bubbles: true }));

		if (details.reason === "clear-trigger") {
			props.onClear?.();
		}

		listCollection.filter(details.inputValue);
	};

	const hiddenInputId = `combobox-hidden-input:${createUniqueId()}`;

	const ref = (ref: HTMLInputElement) => {
		props.ref = ref;
		inputRef = ref;
	};

	const COMBOBOX_TRIGGER_SELECTOR = `div:has(+ [id="${hiddenInputId}"])`;

	const onClickHiddenInput = () => {
		const buttonElement = document.querySelector<HTMLButtonElement>(
			`${COMBOBOX_TRIGGER_SELECTOR} > button`,
		);
		const inputElement = document.querySelector<HTMLInputElement>(
			`${COMBOBOX_TRIGGER_SELECTOR} > button > input`,
		);

		buttonElement?.click();
		inputElement?.focus();
	};

	const onFocusHiddenInput = () => {
		const inputElement = document.querySelector<HTMLInputElement>(
			`${COMBOBOX_TRIGGER_SELECTOR} > button > input`,
		);

		inputElement?.focus();
	};

	const onBlurHiddenInput = () => {
		const inputElement = document.querySelector<HTMLInputElement>(
			`${COMBOBOX_TRIGGER_SELECTOR} > button > input`,
		);

		inputElement?.blur();
	};

	// it's not wrapped in the provider because the internal collection
	// with custom values should not be rendered
	// a search string is not an option which should be displayed
	return (
		<>
			<ComboboxPrimitive.Root
				{...others}
				collection={listCollection.collection()}
				value={value()}
				inputValue={inputValue()}
				onValueChange={onValueChange}
				onInputValueChange={onInputValueChange}
				allowCustomValue>
				{props.children}

				<input
					type="hidden"
					{...hiddenInputProps}
					id={hiddenInputId}
					value={inputValue()}
					onClick={onClickHiddenInput} // because ref is attached to this
					onFocus={onFocusHiddenInput} // because ref is attached to this
					onBlur={onBlurHiddenInput} // because ref is attached to this
					ref={ref}
					class="absolute opacity-0 pointer-events-none"
				/>
			</ComboboxPrimitive.Root>
		</>
	);
};
