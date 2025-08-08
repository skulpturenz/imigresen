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
	const placeholders: any[] = [];
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
				const placeholder = { __circular_placeholder: value };
				placeholders.push(placeholder);
				return placeholder;
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

			const result = conform(
				value.map((x, idx) => deepTransform(x, { key: idx, parent })),
			);

			visited.set(value, result);
			processing.delete(value);

			return result;
		}

		if (value instanceof Set) {
			const parent = value;

			const result = conform(
				new Set([...value].map(x => deepTransform(x, { parent }))),
			);

			visited.set(value, result);
			processing.delete(value);

			return result;
		}

		if (value instanceof Map) {
			const parent = value;

			const result = conform(
				new Map(
					[...value].map(([key, value]) => [
						key,
						deepTransform(value, { key, parent }),
					]),
				),
			);

			visited.set(value, result);
			processing.delete(value);

			return result;
		}

		if (isPlainObject(value)) {
			const parent = value;

			const result = conform(
				Object.fromEntries(
					Object.entries(value).map(([key, value]) => [
						key,
						deepTransform(value, { key, parent }),
					]),
				),
			);

			visited.set(value, result);
			processing.delete(value);

			return result;
		}

		const result = conform(value, context);

		if (typeof value === "object" && value !== null) {
			visited.set(value, result);
			processing.delete(value);
		}

		return result;
	};

	const result = deepTransform(value);

	// Phase 2: Replace all placeholders with direct references
	const replacePlaceholders = (obj: any): any => {
		if (obj && typeof obj === "object") {
			if (obj.__circular_placeholder) {
				return visited.get(obj.__circular_placeholder);
			}

			if (Array.isArray(obj)) {
				for (let i = 0; i < obj.length; i++) {
					obj[i] = replacePlaceholders(obj[i]);
				}
			} else if (obj instanceof Set) {
				const newValues = [];
				for (const item of obj) {
					newValues.push(replacePlaceholders(item));
				}
				obj.clear();
				newValues.forEach(val => obj.add(val));
			} else if (obj instanceof Map) {
				const newEntries = [];
				for (const [key, val] of obj) {
					newEntries.push([key, replacePlaceholders(val)]);
				}
				obj.clear();
				newEntries.forEach(([key, val]) => obj.set(key, val));
			} else if (isPlainObject(obj)) {
				for (const key in obj) {
					obj[key] = replacePlaceholders(obj[key]);
				}
			}
		}
		return obj;
	};

	if (placeholders.length > 0) {
		replacePlaceholders(result);
	}

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

const isRef = (x: unknown) => Boolean((x as Record<string, any>)?.ref);

export const isCircularReference = (x: unknown) =>
	// With direct circular reference access, there are no wrapper objects
	// so this function now returns false since circular refs are direct
	false;

export const unwrap = (node: Record<string, any>) => {
	// With direct circular reference access, no unwrapping is needed
	// Just return the input directly
	return node;
};
