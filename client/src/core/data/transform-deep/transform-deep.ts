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
	const maxDepth = Infinity; // TODO
	const preserveReferences = false; // TODO

	const visited = preserveReferences ? new WeakSet() : null;

	// Helper function to find and apply the appropriate transform
	const getConformer = (value: any): Conformer<any, any> => {
		if (Array.isArray(conformer)) {
			return (
				conformer.find(conformer => conformer.match?.(value)) ??
				identity
			);
		}

		return conformer ?? identity;
	};

	const deepTransform = (value: any, currentDepth = 0): any => {
		// Check depth limit
		if (currentDepth >= maxDepth) {
			return value;
		}

		// Handle circular references
		if (
			preserveReferences &&
			visited &&
			typeof value === "object" &&
			value !== null
		) {
			if (visited.has(value)) {
				return value; // Return as-is to avoid infinite recursion
			}
			visited.add(value);
		}

		// Transform primitive values directly
		if (isPrimitive(value)) {
			const transformFn = getConformer(value);
			return transformFn(value);
		}

		// Handle arrays
		if (Array.isArray(value)) {
			const transformedArray = value.map((item, index) =>
				deepTransform(item, index),
			);
			const transformFn = getConformer(transformedArray);
			return transformFn(transformedArray);
		}

		// Handle Sets
		if (value instanceof Set) {
			const transformedSet = new Set();
			let index = 0;
			for (const item of value) {
				transformedSet.add(deepTransform(item, index++));
			}
			const transformFn = getConformer(transformedSet);
			return transformFn(transformedSet);
		}

		// Handle Maps
		if (value instanceof Map) {
			const transformedMap = new Map();
			for (const [mapKey, mapValue] of value) {
				const transformedValue = deepTransform(mapValue, mapKey);
				transformedMap.set(mapKey, transformedValue);
			}
			const transformFn = getConformer(transformedMap);
			return transformFn(transformedMap);
		}

		// Handle plain objects
		if (isPlainObject(value)) {
			const transformedObject: Record<string, any> = {};
			for (const [objKey, objValue] of Object.entries(value)) {
				transformedObject[objKey] = deepTransform(objValue);
			}
			const transformFn = getConformer(transformedObject);
			return transformFn(transformedObject);
		}

		// For other object types (Date, RegExp, etc.), just transform as-is
		const transformFn = getConformer(value);
		return transformFn(value);
	};

	return deepTransform(value);
};
