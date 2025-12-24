import type {
	FieldEvent,
	FieldPath,
	FieldPathValue,
	FieldProps,
	FieldValues,
	Maybe,
	MaybeValue,
	PartialKey,
	ResponseData,
} from "@modular-forms/solid";
import { spreadProps } from "core/utils";
import { type Component } from "solid-js";

export interface TransformerConfig<TFieldValue = any> {
	[x: string]: {
		type: string;
		transform: (
			value: Maybe<TFieldValue>,
			event: FieldEvent,
		) => Maybe<TFieldValue>;
	};
}

// the reason for this HOC is:
// - modular forms only accepts input events which conform to native input events
// - with some inputs (like `Date`), an input type of date emits a date string not
//   a `Date` object
// - if the `type` of `Field` is `Date` but the value emitted is a string, then modular forms
//   does not accept the value, it just ignores it
// - so we need to specify it as a `string` and then transform the value accordingly
export const withCustomTransform =
	<
		TFieldValues extends FieldValues,
		TFieldName extends FieldPath<TFieldValues>,
		TResponseData extends ResponseData = undefined,
		TFieldProps extends Record<string, any> = FieldPathValue<
			TFieldValues,
			TFieldName
		> extends MaybeValue<string>
			? PartialKey<
					Omit<
						FieldProps<TFieldValues, TResponseData, TFieldName>,
						"of"
					>,
					"type"
				>
			: Omit<FieldProps<TFieldValues, TResponseData, TFieldName>, "of">,
	>(
		C: Component<TFieldProps>,
		transformers = createDefaultTransformers(),
	) =>
	(props: TFieldProps) => {
		if (transformers[props.type]) {
			return <C {...spreadProps(props)} {...transformers[props.type]} />;
		}

		return <C {...spreadProps(props)} />;
	};

const createDefaultTransformers = (): TransformerConfig => {
	const transformDate = (value: Maybe<string>) => {
		if (!value) {
			return value;
		}

		const parsed = new Date(Date.parse(value));

		if (!parsed) {
			return null;
		}

		return parsed;
	};

	const transformNumber = (_: any, event: FieldEvent) => {
		console.log(_, typeof _);
		const input = event.target as HTMLInputElement;
		const maybeNumber = Number(input.value);

		if (Number.isNaN(maybeNumber)) {
			return;
		}

		return maybeNumber;
	};

	return {
		Date: {
			type: "string",
			transform: transformDate,
		},
		number: {
			type: "number",
			transform: transformNumber,
		},
	};
};
