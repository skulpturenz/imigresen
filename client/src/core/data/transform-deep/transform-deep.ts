import { identity, isPlainObject, partialRight } from "es-toolkit";
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
	const visited = new Map();
	const processing = new Set();
	const deferredAssignments: Array<{
		target: any;
		key: string | number;
		originalValue: any;
	}> = [];
	let hasCircularReference = false;

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
		const conform = getConformer(value, context);

		if (typeof value === "object" && value !== null) {
			// If we're already processing this object, it's a circular reference
			if (processing.has(value)) {
				hasCircularReference = true;
				// Return a temporary placeholder that will be replaced
				return { __circular_ref: value };
			}

			// If we've already visited this object, return the cached result
			if (visited.has(value)) {
				return visited.get(value);
			}

			// Mark as being processed
			processing.add(value);
		}

		if (Array.isArray(value)) {
			const parent = value;
			const transformedArray: any[] = [];

			// Transform each element, tracking circular references
			for (let i = 0; i < value.length; i++) {
				const transformedElement = deepTransform(value[i], { key: i, parent });
				
				if (transformedElement && transformedElement.__circular_ref) {
					// Defer the assignment - we'll resolve it when the target is ready
					deferredAssignments.push({
						target: transformedArray,
						key: i,
						originalValue: transformedElement.__circular_ref
					});
					transformedArray[i] = null; // temporary placeholder
				} else {
					transformedArray[i] = transformedElement;
				}
			}

			const result = conform(transformedArray);
			visited.set(value, result);
			processing.delete(value);

			// Resolve any deferred assignments that can now be resolved
			resolveDeferredAssignments();

			return result;
		}

		if (value instanceof Set) {
			const parent = value;
			const transformedValues: any[] = [];

			// Transform each element, tracking circular references
			for (const item of value) {
				const transformedItem = deepTransform(item, { parent });
				
				if (transformedItem && transformedItem.__circular_ref) {
					// For Sets, we need a different approach since we can't defer by index
					// We'll add the resolved value after processing
					deferredAssignments.push({
						target: null, // Will be set to the final Set
						key: 'SET_VALUE',
						originalValue: transformedItem.__circular_ref
					});
					transformedValues.push({ __deferred_set_value: transformedItem.__circular_ref });
				} else {
					transformedValues.push(transformedItem);
				}
			}

			const result = conform(new Set(transformedValues.filter(v => !v || !v.__deferred_set_value)));
			visited.set(value, result);
			processing.delete(value);

			// Add deferred set values
			for (const item of transformedValues) {
				if (item && item.__deferred_set_value) {
					const resolvedValue = visited.get(item.__deferred_set_value);
					if (resolvedValue) {
						result.add(resolvedValue);
					}
				}
			}

			// Resolve any other deferred assignments
			resolveDeferredAssignments();

			return result;
		}

		if (value instanceof Map) {
			const parent = value;
			const transformedEntries: Array<[any, any]> = [];

			// Transform each value, tracking circular references
			for (const [key, val] of value) {
				const transformedValue = deepTransform(val, { key, parent });
				
				if (transformedValue && transformedValue.__circular_ref) {
					// Defer the assignment
					const entry: [any, any] = [key, null]; // temporary placeholder
					transformedEntries.push(entry);
					deferredAssignments.push({
						target: entry,
						key: 1, // value position in the entry array
						originalValue: transformedValue.__circular_ref
					});
				} else {
					transformedEntries.push([key, transformedValue]);
				}
			}

			const result = conform(new Map(transformedEntries));
			visited.set(value, result);
			processing.delete(value);

			// Resolve any deferred assignments
			resolveDeferredAssignments();

			return result;
		}

		if (isPlainObject(value)) {
			const parent = value;
			const transformedEntries: Array<[string, any]> = [];

			// Transform each property, tracking circular references
			for (const [key, val] of Object.entries(value)) {
				const transformedValue = deepTransform(val, { key, parent });
				
				if (transformedValue && transformedValue.__circular_ref) {
					// Defer the assignment
					transformedEntries.push([key, null]); // temporary placeholder
					deferredAssignments.push({
						target: null, // Will be set to the final object
						key: key,
						originalValue: transformedValue.__circular_ref
					});
				} else {
					transformedEntries.push([key, transformedValue]);
				}
			}

			const result = conform(Object.fromEntries(transformedEntries));
			visited.set(value, result);
			processing.delete(value);

			// Update deferred assignments with the actual target object
			for (const assignment of deferredAssignments) {
				if (assignment.target === null && typeof assignment.key === 'string') {
					assignment.target = result;
				}
			}

			// Resolve any deferred assignments that can now be resolved
			resolveDeferredAssignments();

			return result;
		}

		const result = conform(value, context);

		if (typeof value === "object" && value !== null) {
			visited.set(value, result);
			processing.delete(value);
		}

		return result;
	};

	const resolveDeferredAssignments = () => {
		let resolved = true;
		while (resolved) {
			resolved = false;
			for (let i = deferredAssignments.length - 1; i >= 0; i--) {
				const assignment = deferredAssignments[i];
				const resolvedValue = visited.get(assignment.originalValue);
				
				if (resolvedValue && assignment.target) {
					assignment.target[assignment.key] = resolvedValue;
					deferredAssignments.splice(i, 1);
					resolved = true;
				}
			}
		}
	};

	const result = deepTransform(value);

	// Final resolution of any remaining deferred assignments
	resolveDeferredAssignments();

	if (typeof result === "object" && hasCircularReference) {
		Object.defineProperty(result, "__meta__", {
			value: {
				hasCircularReference,
			},
			enumerable: false,
		});
	}

	return result;
};

