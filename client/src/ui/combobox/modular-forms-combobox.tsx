import type { PolymorphicProps } from "@kobalte/core";
import type { ComboboxRootProps } from "@kobalte/core/combobox";
import {
	setValue,
	type FieldPath,
	type FieldValues,
	type FormStore,
} from "@modular-forms/solid";
import { spreadProps } from "core/utils";
import { partial } from "es-toolkit";
import type { ValidComponent } from "solid-js";
import { Combobox } from "ui/combobox";

export interface ModularFormComboboxBaseProps<
	TFieldValues extends FieldValues,
	TFieldPaths extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	form: FormStore<TFieldValues>;
	name: TFieldPaths;
}

export type ModularFormsComboboxProps<
	TOption,
	TFieldValues extends FieldValues,
	TOptionGroup = never,
	TComponent extends ValidComponent = "div",
> = Omit<
	PolymorphicProps<
		TComponent,
		Omit<ComboboxRootProps<TOption, TOptionGroup, TComponent>, "name"> &
			ModularFormComboboxBaseProps<TFieldValues>
	>,
	"onChange"
>;

export const ModularFormsCombobox = <
	TOption,
	TFieldValues extends FieldValues,
	TOptionGroup = never,
	TComponent extends ValidComponent = "div",
>(
	props: ModularFormsComboboxProps<
		TOption,
		TFieldValues,
		TOptionGroup,
		TComponent
	>,
) => (
	<Combobox
		{...spreadProps(props)}
		onChange={partial(setValue, props.form, props.name)}
	/>
);
