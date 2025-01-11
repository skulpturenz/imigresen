import { isNil } from "es-toolkit";
import { get } from "es-toolkit/compat";
import type { Schema } from "yup";

// TODO: options types
export const whenOptions =
	<T extends Schema, U extends Schema>(
		_values: any,
		schema: T,
		options: any,
	) =>
	(
		predicate: (options: any) => boolean,
		fn: (schema: T, options: any) => U,
	) => {
		if (predicate(options)) {
			return fn(schema, options);
		}

		return schema;
	};

export const toRequired = <T extends Schema>(schema: T, _options: any) =>
	schema.required();

export const toNullish = <T extends Schema>(schema: T, _options: any) =>
	schema.nullable().optional().default(null);

// TODO: options types
export const hasEveryParentField =
	(...paths: string[]) =>
	(options: any) =>
		paths.every(path => !isNil(get(options.parent, path)));

// TODO: options types
export const hasSomeParentField =
	(...paths: string[]) =>
	(options: any) =>
		paths.some(path => !isNil(get(options.parent, path)));

// TODO: types
export const isParentFieldEqual =
	(path: string, value: any) => (options: any) =>
		get(options.parent, path) === value;
