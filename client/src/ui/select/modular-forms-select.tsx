import type { PolymorphicProps } from "@kobalte/core";
import type { SelectRootProps } from "@kobalte/core/select";
import {
	setValue,
	type FieldPath,
	type FieldValues,
	type FormStore,
} from "@modular-forms/solid";
import { spreadProps } from "core/utils";
import type { ValidComponent } from "solid-js";
import { Select } from "ui/select";

export interface ModularFormSelectBaseProps<
	TFieldValues extends FieldValues,
	TFieldPaths extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	form: FormStore<TFieldValues>;
	name: TFieldPaths;
}

export type ModularFormsSelectProps<
	TOption,
	TFieldValues extends FieldValues,
	TOptionGroup = never,
	TComponent extends ValidComponent = "div",
> = Omit<
	PolymorphicProps<
		TComponent,
		Omit<SelectRootProps<TOption, TOptionGroup, TComponent>, "name"> &
			ModularFormSelectBaseProps<TFieldValues>
	>,
	"onChange"
>;

export const ModularFormsSelect = <
	TOption,
	TFieldValues extends FieldValues,
	TOptionGroup = never,
	TComponent extends ValidComponent = "div",
>(
	props: ModularFormsSelectProps<
		TOption,
		TFieldValues,
		TOptionGroup,
		TComponent
	>,
) => {
	const onChange = (value: TOption) => {
		if (props.optionValue) {
			setValue(props.form, props.name, props.optionValue(value));

			return;
		}

		setValue(props.form, props.name, props.optionValue);
	};

	return <Select {...spreadProps(props)} onChange={onChange} />;
};
