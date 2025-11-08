import type {
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
import type { Component } from "solid-js";

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
	) =>
	(props: TFieldProps) => {
		if (props.type === "Date") {
			const transform = (value: Maybe<string>) => {
				if (!value) {
					return value;
				}

				const parsed = new Date(Date.parse(value));

				if (!parsed) {
					return null;
				}

				return parsed;
			};

			return (
				<C
					{...spreadProps(props)}
					type="string"
					transform={transform}
				/>
			);
		}

		return <C {...spreadProps(props)} />;
	};
