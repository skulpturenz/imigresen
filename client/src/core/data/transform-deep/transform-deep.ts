import { identity, isPlainObject, isPrimitive, partialRight } from "es-toolkit";
import type { Conformer, ConformerContext, Transform } from "./types";

export const createConformer = (
	conformFn: (value: any, context?: ConformerContext) => any,
	predicateFn?: (value: any, context?: ConformerContext) => boolean,
) => {
	const result = (value: any, context?: ConformerContext) =>
		conformFn(value, context);

	Object.assign(result, {
		match: predicateFn,
	});

	return result;
};

export const transformDeep: Transform = (value, conformer): any => {
	const visited = new Set();

	const getConformer = (
		value: any,
		context?: ConformerContext,
	): Conformer<any, any> => {
		if (Array.isArray(conformer)) {
			const firstMatch = conformer.find(conformer =>
				conformer.match?.(value, context),
			);

			if (
				!firstMatch ||
				(firstMatch.match && !firstMatch.match(value, context))
			) {
				return identity;
			}

			return partialRight(firstMatch, context);
		}

		if (conformer.match && !conformer.match(value, context)) {
			return identity;
		}

		return partialRight(conformer, context);
	};

	const deepTransform = (value: any, context?: ConformerContext): any => {
		if (typeof value === "object" && value !== null) {
			if (visited.has(value)) {
				throw new Error("Circular reference detected");
			}

			visited.add(value);
		}

		const conform = getConformer(value, context);

		if (isPrimitive(value)) {
			return conform(value, context);
		}

		if (Array.isArray(value)) {
			const parent = value;

			return conform(
				value.map((x, idx) => deepTransform(x, { key: idx, parent })),
			);
		}

		if (value instanceof Set) {
			const parent = value;

			return conform(
				new Set([...value].map(x => deepTransform(x, { parent }))),
			);
		}

		if (value instanceof Map) {
			const parent = value;

			return conform(
				new Map(
					[...value].map(([key, value]) => [
						key,
						deepTransform(value, { key, parent }),
					]),
				),
			);
		}

		if (isPlainObject(value)) {
			const parent = value;

			return conform(
				Object.fromEntries(
					Object.entries(value).map(([key, value]) => [
						key,
						deepTransform(value, { key, parent }),
					]),
				),
			);
		}

		return conform(value, context);
	};

	return deepTransform(value);
};
