import { identity } from "es-toolkit";
import type { TransformFn, TransformOptions, Transformable } from "./types";

const isPrimitive = (value: any): boolean => {
	return (
		value === null ||
		value === undefined ||
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	);
};

const isPlainObject = (value: any): value is Record<string, any> => {
	return (
		value !== null &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		!(value instanceof Date) &&
		!(value instanceof RegExp) &&
		!(value instanceof Set) &&
		!(value instanceof Map)
	);
};

export const transformDeep = <T extends Transformable, U>(
	data: T,
	options: TransformOptions<any, U>,
): any => {
	const {
		transform,
		transforms,
		defaultTransform,
		maxDepth = Infinity,
		preserveReferences = false,
	} = options;

	const visited = preserveReferences ? new WeakSet() : null;

	// Helper function to find and apply the appropriate transform
	const getTransformFunction = (
		value: any,
		key?: string | number,
		parent?: any,
	): TransformFn<any, any> => {
		return (
			transforms?.find(({ predicate }) => predicate(value, key, parent))
				?.transform ??
			defaultTransform ??
			transform ??
			identity
		);
	};

	const deepTransform = (
		value: any,
		key?: string | number,
		parent?: any,
		currentDepth = 0,
	): any => {
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
			const transformFn = getTransformFunction(value, key, parent);
			return transformFn(value, key, parent);
		}

		// Handle arrays
		if (Array.isArray(value)) {
			const transformedArray = value.map((item, index) =>
				deepTransform(item, index, value, currentDepth + 1),
			);
			const transformFn = getTransformFunction(
				transformedArray,
				key,
				parent,
			);
			return transformFn(transformedArray, key, parent);
		}

		// Handle Sets
		if (value instanceof Set) {
			const transformedSet = new Set();
			let index = 0;
			for (const item of value) {
				transformedSet.add(
					deepTransform(item, index++, value, currentDepth + 1),
				);
			}
			const transformFn = getTransformFunction(
				transformedSet,
				key,
				parent,
			);
			return transformFn(transformedSet, key, parent);
		}

		// Handle Maps
		if (value instanceof Map) {
			const transformedMap = new Map();
			for (const [mapKey, mapValue] of value) {
				const transformedValue = deepTransform(
					mapValue,
					mapKey,
					value,
					currentDepth + 1,
				);
				transformedMap.set(mapKey, transformedValue);
			}
			const transformFn = getTransformFunction(
				transformedMap,
				key,
				parent,
			);
			return transformFn(transformedMap, key, parent);
		}

		// Handle plain objects
		if (isPlainObject(value)) {
			const transformedObject: Record<string, any> = {};
			for (const [objKey, objValue] of Object.entries(value)) {
				transformedObject[objKey] = deepTransform(
					objValue,
					objKey,
					value,
					currentDepth + 1,
				);
			}
			const transformFn = getTransformFunction(
				transformedObject,
				key,
				parent,
			);
			return transformFn(transformedObject, key, parent);
		}

		// For other object types (Date, RegExp, etc.), just transform as-is
		const transformFn = getTransformFunction(value, key, parent);
		return transformFn(value, key, parent);
	};

	return deepTransform(data);
};
