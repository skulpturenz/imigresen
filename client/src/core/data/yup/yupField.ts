import type { FieldValue, Maybe, ValidateField } from "@modular-forms/solid";
import type { Schema, ValidationError } from "yup";
import type { ValidateOptions } from "./types";

// see: https://github.com/fabian-hiller/modular-forms/blob/main/packages/solid/src/adapters/zodField.ts
export const yupField = <
	TFieldValue extends FieldValue = FieldValue,
	TContext extends Record<string, any> = Record<string, any>,
>(
	schema: Schema<TFieldValue, TContext>,
	options?: ValidateOptions<TContext>,
): ValidateField<TFieldValue> => {
	return async (value: Maybe<TFieldValue>) => {
		const error: ValidationError | null = await schema
			.validate(value, {
				...options,
				get context() {
					return options?.context();
				},
			})
			.then(() => null)
			.catch(error => {
				if (options?.debug) {
					console.error(error);
				}

				return error;
			});

		if (!error) {
			return "";
		}

		return error.errors.at(0) ?? "";
	};
};
