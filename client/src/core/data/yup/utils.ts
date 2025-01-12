import type { Flatten } from "@solid-primitives/i18n";
import { makeWalkBfs } from "core/data//walk";
import { makeParents } from "core/data/walk/parents";
import { isNil } from "es-toolkit";
import { get } from "es-toolkit/compat";
import type { Schema, SchemaDescription, SchemaObjectDescription } from "yup";

// TODO: options types
export const whenOptions =
	<T extends Schema, U extends Schema>(
		predicate: (options: any) => boolean,
		fn: (schema: T, options: any) => U,
	) =>
	(_values: any, schema: T, options: any) => {
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
// TODO: don't depend on i18n
export const isParentFieldEqual =
	<T extends Record<string, any> = Record<string, any>>(
		path: keyof Flatten<T>,
		value: any,
	) =>
	(options: any) =>
		get(options.parent, path) === value;

export const findOptionalFieldPaths = <T extends Schema>(schema: T) => {
	const description = schema.describe({
		context: {
			isFinal: true,
		},
	}) as SchemaObjectDescription;
	const walk = makeWalkBfs(
		(parent: SchemaDescription) =>
			Object.values(
				(parent as SchemaObjectDescription)?.fields ??
					Object.create(null),
			) as SchemaDescription[],
	);
	const walkWithParents = makeParents(walk);

	const requiredFields = new Set<string>();

	for (const { node, parents } of walkWithParents(description)) {
		const path = [...parents, node]
			.map((node, idx, arr) => {
				const parent = arr.at(Math.max(idx - 1, 0)) ?? null;

				if (!parent) {
					return "";
				}

				const key = Object.entries(
					(parent as SchemaObjectDescription).fields,
				)
					.find(([_, value]) => value === node)
					?.at(0);

				return key ?? "";
			})
			.filter(Boolean)
			.join(".");

		if (node.tests.some(test => test.name === "required")) {
			requiredFields.add(path);
		}

		// TODO: check
		if (node.optional === true) {
			requiredFields.add(path);
		}
	}

	return requiredFields;
};
