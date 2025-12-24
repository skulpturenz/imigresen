import type {
	FieldValues,
	PartialValues,
	ValidateForm,
} from "@modular-forms/solid";
import { getOwner, runWithOwner } from "solid-js";
import { type Schema, type ValidationError } from "yup";
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
	const owner = options?.owner ?? getOwner();

	return async (values: PartialValues<TFieldValues>) => {
		const error: ValidationError | null = await runWithOwner(owner, () =>
			schema
				.validate(values, {
					...options,
					// if `abortEarly` then errors on only 1 field will show
					// default behaviour: show all errors
					abortEarly: options?.abortEarly ?? false,
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
				}),
		);

		if (!error) {
			return Object.create(null);
		}

		const getAllErrors = () => {
			const aggregateErrors = error.inner.reduce((acc, error) => {
				if (!error.path || (error.path && acc[error.path])) {
					return acc;
				}

				return {
					...acc,
					[error.path]: error.errors.at(0),
				};
			}, Object.create(null));

			if (error.errors.length > 0 && error.path) {
				return {
					[error.path]: error.errors.at(0),
					...aggregateErrors,
				};
			}

			return aggregateErrors;
		};

		const errors = getAllErrors();

		if (import.meta.env.DEV) {
			console.warn(errors);
		}

		return errors;
	};
};
