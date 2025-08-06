import { identity, isPlainObject, isPrimitive } from "es-toolkit";
import type { Conformer, Transform } from "./types";

export const createConformer = (
	conformFn: (value: any) => any,
	predicateFn?: (value: any) => boolean,
) => {
	const result = (value: any) => conformFn(value);

	Object.assign(result, {
		match: predicateFn,
	});

	return result;
};

export const transformDeep: Transform = (value, conformer): any => {
	const visited = new Set();

	const getConformer = (value: any): Conformer<any, any> => {
		if (Array.isArray(conformer)) {
			return (
				conformer.find(conformer => conformer.match?.(value)) ??
				identity
			);
		}

		return conformer ?? identity;
	};

	const deepTransform = (value: any): any => {
		// Handle circular references
		if (typeof value === "object" && value !== null) {
			if (visited.has(value)) {
				throw new Error("Circular reference detected");
			}

			visited.add(value);
		}

		const conform = getConformer(value);

		if (isPrimitive(value)) {
			return conform(value);
		}

		if (Array.isArray(value)) {
			return conform(value.map(deepTransform));
		}

		if (value instanceof Set) {
			// TODO: `Object.values` returns an empty array with tests
			return conform(new Set([...value.values()].map(deepTransform)));
		}

		if (value instanceof Map) {
			// TODO: `Object.entries` returns an empty array with tests
			return conform(
				new Map(
					[...value.entries()].map(([key, value]) => [
						key,
						deepTransform(value),
					]),
				),
			);
		}

		if (isPlainObject(value)) {
			return conform(
				Object.fromEntries(
					Object.entries(value).map(([key, value]) => [
						key,
						deepTransform(value),
					]),
				),
			);
		}

		return conform(value);
	};

	return deepTransform(value);
};
