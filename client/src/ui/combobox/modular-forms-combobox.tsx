import type { ComboboxRootProps } from "@ark-ui/solid/combobox";
import {
	setValue,
	type FieldPath,
	type FieldValues,
	type FormStore,
} from "@modular-forms/solid";
import { spreadProps } from "core/utils";
import { splitProps } from "solid-js";
import { Combobox, type ComboboxInputValueChangeDetails } from "ui/combobox";

export interface ModularFormsComboboxBaseProps<
	TFieldValues extends FieldValues,
	TFieldPaths extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	form: FormStore<TFieldValues>;
	name: TFieldPaths;
	value?: string | string[];
}

export type ModularFormsComboboxProps<
	TCollection extends string | Record<string, any>,
	TFieldValues extends FieldValues,
> = Omit<
	Omit<ComboboxRootProps<TCollection>, "form" | "value"> &
		ModularFormsComboboxBaseProps<TFieldValues>,
	"onInputValueChange"
>;

export const ModularFormsCombobox = <
	TCollection extends string | Record<string, any>,
	TFieldValues extends FieldValues,
>(
	props: ModularFormsComboboxProps<TCollection, TFieldValues>,
) => {
	const [_ignored, rest] = splitProps(props, ["form"]);
	const onInputValueChange = (details: ComboboxInputValueChangeDetails) => {
		console.log(details, props.name);
		setValue(props.form, props.name, details.inputValue as any);
	};

	const getValue = (
		props: ModularFormsComboboxProps<TCollection, TFieldValues>,
	) => {
		if (!props.value) {
			return [];
		}

		if (Array.isArray(props.value)) {
			return props.value;
		}

		return [props.value];
	};

	return (
		<Combobox
			{...spreadProps(rest)}
			value={getValue(props)}
			onInputValueChange={onInputValueChange}
		/>
	);
};
