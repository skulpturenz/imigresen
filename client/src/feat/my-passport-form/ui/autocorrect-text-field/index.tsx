import type { PolymorphicProps } from "@kobalte/core";
import type { TextFieldInputProps } from "@kobalte/core/text-field";
import {
	type FieldPath,
	type FieldPathValue,
	type FieldValues,
	type FormStore,
	setValue as setFormValue,
} from "@modular-forms/solid";
import { asc, get, localeAsc, multiSort } from "core/data/sort";
import { spreadProps } from "core/utils/utils";
import { invariant, isNil } from "es-toolkit";
import { distance } from "fastest-levenshtein";
import { closestOptionMatch } from "feat/my-passport-form/utils/closest-option-match";
import { createEffect, createSignal, type ValidComponent } from "solid-js";
import type { JSX } from "solid-js/h/jsx-runtime";
import { Select, SelectContent, SelectItem, SelectTrigger } from "ui/select";
import { TextField } from "ui/text-field";

export interface AutocorrectTextFieldBaseProps<
	F extends FieldValues,
	N extends FieldPath<F> = FieldPath<F>,
> {
	form: FormStore<F>;
	name: N;
	value?: string;
	options: string[];
}

export type AutocorrectTextFieldProps<
	F extends FieldValues,
	N extends FieldPath<F> = FieldPath<F>,
	T extends ValidComponent = "input",
> = Omit<
	Omit<
		PolymorphicProps<T, TextFieldInputProps<T>>,
		keyof AutocorrectTextFieldBaseProps<F, N>
	> &
		AutocorrectTextFieldBaseProps<F, N>,
	"onChange"
>;

export const AutocorrectTextField = <
	F extends FieldValues,
	N extends FieldPath<F> = FieldPath<F>,
>(
	props: AutocorrectTextFieldProps<F>,
) => {
	const [value, setValue] = createSignal("");

	const [showOptions, setShowOptions] = createSignal(false);
	const toggleShowOptions = () => setShowOptions(showOptions => !showOptions);

	const [isClosestMatch, setIsClosestMatch] = createSignal(false);
	const toggleIsClosestMatch = () =>
		setIsClosestMatch(isClosestMatch => !isClosestMatch);

	const [closestOptions, setClosestOptions] = createSignal([] as string[]);
	const findClosestOptions = (value: string) => {
		const { min, max, distances } = props.options.reduce((acc, option) => {
			const calculated = distance(value, option);

			const getMin = () => {
				if (isNil(acc.min)) {
					return calculated;
				}

				return Math.min(calculated, acc.min);
			};

			const getMax = () => {
				if (isNil(acc.max)) {
					return calculated;
				}

				return Math.max(calculated, acc.max);
			};

			return {
				distances: {
					...acc.distances,
					[option]: calculated,
				},
				min: getMin(),
				max: getMax(),
			};
		}, Object.create(null));
		const midDistance = Math.floor((min + max) / 2);

		const getDistance = ([_, distance]: [string, number]) => distance;
		const getOption = ([option, _]: [string, number]) => option;
		const sortByDistanceOptionAsc = multiSort(
			get(getDistance)(asc),
			get(getOption)(localeAsc),
		);

		const filteredOptions = Object.entries<number>(distances)
			.sort(sortByDistanceOptionAsc)
			.reduce((acc, [option, distance]) => {
				if (Number(distance) > midDistance) {
					return acc;
				}

				return [...acc, option];
			}, [] as string[]);
		return filteredOptions;
	};

	const onClickSelect = () => {
		if (isClosestMatch()) {
			toggleShowOptions();
			toggleIsClosestMatch();

			return;
		}
	};

	const onControlledChange = (value: string | null) => {
		setValue(value ?? "");
		setFormValue(
			props.form,
			props.name,
			(value ?? "") as FieldPathValue<F, N>,
		);
	};

	const onSelectChange = (value: string | null) => {
		if (value === null) {
			return;
		}

		onControlledChange(value);
	};

	const hideOptions = () => {
		if (!showOptions()) {
			return;
		}

		toggleShowOptions();
	};

	const onChange: JSX.ChangeEventHandler<any, InputEvent> = event => {
		const newValue = event?.target?.value;

		invariant(
			newValue !== null && newValue !== undefined,
			"Input event is invalid",
		);

		onControlledChange(newValue ?? "");
	};

	const onBlur: JSX.FocusEventHandler<any, FocusEvent> = event => {
		const closestMatch = closestOptionMatch(value(), props.options);

		if (closestMatch !== value() && value()) {
			setClosestOptions(findClosestOptions(value()));

			onControlledChange(closestMatch);
			toggleIsClosestMatch();
		}

		const propsOnBlur = props.onBlur;
		invariant(
			!propsOnBlur || typeof propsOnBlur === "function",
			"`onBlur` specified is not invokable",
		);

		propsOnBlur?.(event);
	};

	// don't `onChange`
	createEffect(() => {
		setValue(props.value ?? "");
	});

	return (
		<>
			<Select
				options={closestOptions()}
				itemComponent={props => (
					<SelectItem onClick={toggleShowOptions} item={props.item}>
						{props.item.rawValue}
					</SelectItem>
				)}
				class="relative"
				onClick={onClickSelect}
				onChange={onSelectChange}
				optionValue={option => option}
				open={showOptions()}
				value={value()}>
				<TextField
					{...spreadProps(props)}
					value={value()}
					onChange={onChange}
					onBlur={onBlur}
				/>

				<SelectTrigger
					tabIndex={-1}
					class="absolute top-0 right-0 -z-30"
				/>
				<SelectContent onFocusOutside={hideOptions} />
			</Select>
		</>
	);
};
