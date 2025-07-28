import { get } from "es-toolkit/compat";
import { isNil } from "es-toolkit/predicate";
import type { Schema } from "yup";

export const whenOptions =
	<T extends Schema, U extends Schema>(
		predicate: (options: any) => boolean,
		fn: (schema: T, options: ResolveOptions) => U,
	) =>
	(_values: any, schema: T, options: any) => {
		if (predicate(options)) {
			return fn(schema, options);
		}

		return schema;
	};

export const toRequired = <T extends Schema>(
	schema: T,
	_options: ResolveOptions,
) => schema.required();

export const toNullish = <T extends Schema>(
	schema: T,
	_options: ResolveOptions,
) => schema.nullable().optional().default(null);

export const hasEveryParentField =
	(...paths: string[]) =>
	(options: ResolveOptions) =>
		paths.every(path => !isNil(get(options.parent, path)));

export const hasSomeParentField =
	(...paths: string[]) =>
	(options: ResolveOptions) =>
		paths.some(path => !isNil(get(options.parent, path)));

export const isParentFieldEqual =
	(path: string, value: any) => (options: ResolveOptions) =>
		get(options.parent, path) === value;

type ResolveOptions<TContext = any> = {
	value?: any;
	parent?: any;
	context?: TContext;
};
