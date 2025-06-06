import {
	setValue,
	type FieldPath,
	type FieldValues,
	type FormStore,
} from "@modular-forms/solid";
import { spreadProps } from "core/utils";
import { partial } from "es-toolkit";
import {
	DateRangePicker,
	type DateRangePickerProps,
} from "./date-range-picker";

export interface ModularFormsDateRangePickerProps<
	TFieldValues extends FieldValues,
	TFieldPaths extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<DateRangePickerProps, "onChange"> {
	form: FormStore<TFieldValues>;
	name: TFieldPaths;
}

export const ModularFormsDateRangePicker = <TFieldValues extends FieldValues>(
	props: ModularFormsDateRangePickerProps<TFieldValues>,
) => (
	<DateRangePicker
		{...(spreadProps(props) as any)}
		onChange={partial(setValue, props.form, props.name)}
	/>
);
