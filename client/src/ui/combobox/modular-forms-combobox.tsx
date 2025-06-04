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
	value?: string;
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
	// TODO: not so sure why there is a difference here with the normal `Combobox`
	// on that we can specify both `value` and `inputValue` and any custom input stays
	// but for this if `value` is specified any value we type is erased out
	// might have to do with the type of option?
	const [_ignored, rest] = splitProps(props, ["form", "value"]);
	const onInputValueChange = (details: ComboboxInputValueChangeDetails) => {
		setValue(props.form, props.name, details.inputValue as any);
	};

	return (
		<Combobox
			{...spreadProps(rest)}
			inputValue={props.value ?? ""}
			onInputValueChange={onInputValueChange}
		/>
	);
};
