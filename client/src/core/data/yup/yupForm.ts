import type {
	FieldValues,
	PartialValues,
	ValidateForm,
} from "@modular-forms/solid";
import { invariant } from "es-toolkit";
import type { Schema, ValidationError } from "yup";
import type { ValidateOptions } from "./types";

// see: https://github.com/fabian-hiller/modular-forms/blob/main/packages/solid/src/adapters/zodForm.ts
export const yupForm = <
	TType = any,
	TContext extends Record<string, any> = Record<string, any>,
	TFieldValues extends FieldValues = FieldValues,
>(
	schema: Schema<TType, TContext, TFieldValues>,
	options?: ValidateOptions<TContext>,
): ValidateForm<TFieldValues> => {
	return async (values: PartialValues<TFieldValues>) => {
		const error: ValidationError | null = await schema
			.validate(values, {
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
			return Object.create(null);
		}

		invariant(error.path, "undefined path");

		return Object.fromEntries(
			error.errors.map(message => [error.path, message]),
		);
	};
};
