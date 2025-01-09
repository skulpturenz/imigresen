import type {
	FieldValues,
	PartialValues,
	ValidateForm,
} from "@modular-forms/solid";
import { invariant } from "es-toolkit";
import type { Accessor } from "solid-js";
import type { Schema, ValidationError } from "yup";
import type { ValidateOptions } from "./types";

export const yupForm = <
	TType = any,
	TContext extends Record<string, any> = Record<string, any>,
	TFieldValues extends FieldValues = FieldValues,
>(
	schema: Schema<TType, Accessor<TContext>, TFieldValues>,
	options?: ValidateOptions<TContext>,
): ValidateForm<TFieldValues> => {
	return async (values: PartialValues<TFieldValues>) => {
		const error: ValidationError | null = await schema
			.validate(values, options)
			.then(() => null)
			.catch(err => err);

		if (!error) {
			return Object.create(null);
		}

		invariant(error.path, "undefined path");

		return Object.fromEntries(
			error.errors.map(message => [error.path, message]),
		);
	};
};
