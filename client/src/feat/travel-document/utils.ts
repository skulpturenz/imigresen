import { makeWalkBfs } from "core/data/walk";
import { makeParents } from "core/data/walk/parents";
import type { Schema, SchemaDescription, SchemaObjectDescription } from "yup";

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
