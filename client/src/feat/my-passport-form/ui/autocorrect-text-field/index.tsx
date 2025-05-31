import type { PolymorphicProps } from "@kobalte/core";
import type { TextFieldInputProps } from "@kobalte/core/text-field";
import {
	type FieldPath,
	type FieldPathValue,
	type FieldValues,
	type FormStore,
	setValue as setFormValue,
} from "@modular-forms/solid";
import { spreadProps } from "core/utils";
import { invariant } from "es-toolkit";
import { closestOptionMatch } from "feat/my-passport-form/utils/closest-option-match";
import { createSignal, type ValidComponent } from "solid-js";
import type { JSX } from "solid-js/h/jsx-runtime";
import { TextField } from "ui/text-field";

export interface AutocorrectTextFieldOwnProps<
	F extends FieldValues,
	N extends FieldPath<F> = FieldPath<F>,
> {
	form: FormStore<F>;
	name: N;
	value?: string;
	onChange?: (value: string) => void;
	options: string[];
}

export type AutocorrectTextFieldProps<
	F extends FieldValues,
	N extends FieldPath<F> = FieldPath<F>,
	T extends ValidComponent = "input",
> = Omit<
	PolymorphicProps<T, TextFieldInputProps<T>>,
	keyof AutocorrectTextFieldOwnProps<F, N>
> &
	AutocorrectTextFieldOwnProps<F, N>;

export const AutocorrectTextField = <
	F extends FieldValues,
	N extends FieldPath<F> = FieldPath<F>,
>(
	props: AutocorrectTextFieldProps<F>,
) => {
	const [value, setValue] = createSignal(props.value ?? "");

	const onChange: JSX.ChangeEventHandler<any, InputEvent> = event => {
		const newValue = event?.target?.value;

		invariant(newValue, "Input event is invalid");

		setValue(newValue);
		setFormValue(props.form, props.name, newValue as FieldPathValue<F, N>);
	};

	const onBlur: JSX.FocusEventHandler<any, FocusEvent> = event => {
		const closestMatch = closestOptionMatch(value(), props.options);

		if (closestMatch !== value()) {
			setValue(closestMatch);
			setFormValue(
				props.form,
				props.name,
				closestMatch as FieldPathValue<F, N>,
			);
		}

		const propsOnBlur = props.onBlur;
		invariant(
			!propsOnBlur || typeof propsOnBlur === "function",
			"`onBlur` specified is not invokable",
		);

		propsOnBlur?.(event);
	};

	return (
		<TextField
			{...spreadProps(props)}
			value={value()}
			onChange={onChange}
			onBlur={onBlur}
		/>
	);
};
