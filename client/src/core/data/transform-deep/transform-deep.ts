import { identity, isPlainObject, partialRight } from "es-toolkit";
import type { Conformer, ConformerContext } from "./types";

export const createConformer = <T = unknown, U = unknown>(
	conformFn: (value: T, context?: ConformerContext) => U,
	predicateFn?: (value: unknown, context?: ConformerContext) => boolean,
) => {
	const result = (value: any, context?: ConformerContext) =>
		conformFn(value, context);

	Object.assign(result, {
		match: predicateFn,
	});

	return result as Conformer<T, U>;
};

export const transformDeep = <T = unknown, U = unknown>(
	value: T,
	conformer: Conformer<any, any> | Conformer<any, any>[],
): U => {
	const visited = new Map();
	const circularReferences = new Map();

	const isRef = (x: unknown) =>
		x && typeof x === "object" && "__type" in x && "ref" in x;

	const isCircularRef = (x: unknown) =>
		isRef(x) && (x as any).__type === "circular";

	const linkRefs = () => {
		circularReferences.forEach(({ parent, key }, placeholder) => {
			// sets don't have a notion of "keys", the key is the value
			if (parent instanceof Set) {
				parent.delete(key);
				parent.add(visited.get(placeholder));

				return;
			}

			// arrays, maps and plain objects have keys and values
			if (!(parent && key in parent)) {
				return;
			}

			const conformed = visited.get(placeholder);

			parent[key] = conformed;
		});
	};

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

	const conformed = (initial: any, final: any) => {
		// in the case of circular references we have the result of
		// a call higher up the stack that depends on a value lower
		// so we need to mark the value lower as visited before we can
		// link the circular reference in the final result
		visited.set(initial, final);
		linkRefs();

		return final;
	};

	const deepTransform = (value: any, context?: ConformerContext): any => {
		const conform = getConformer(value, context);

		if (typeof value === "object" && value !== null) {
			if (visited.has(value)) {
				const ref = { __type: "circular", ref: null };

				return ref;
			}

			// set to null and override later so that we can check for circular references
			visited.set(value, null);
		}

		if (Array.isArray(value)) {
			const parent = value;

			const result = conform(
				value.reduce<any[]>((acc, x, idx) => {
					const result = deepTransform(x, { key: idx, parent });

					if (isCircularRef(result)) {
						circularReferences.set(x, { key: idx, parent: acc });
					}

					acc.push(result);

					return acc;
				}, []),
			);

			return conformed(value, result);
		}

		if (value instanceof Set) {
			const parent = value;

			const result = conform(
				[...value].reduce<Set<any>>((acc, x) => {
					const result = deepTransform(x, { parent });

					if (isCircularRef(result)) {
						circularReferences.set(x, {
							key: result,
							parent: acc,
						});
					}

					acc.add(result);

					return acc;
				}, new Set()),
			);

			return conformed(value, result);
		}

		if (value instanceof Map) {
			const parent = value;

			const result = conform(
				[...value].reduce<Map<any, any>>((acc, [key, value]) => {
					const result = deepTransform(value, { key: key, parent });

					if (isCircularRef(result)) {
						circularReferences.set(value, {
							key: key,
							parent: acc,
						});
					}

					acc.set(key, result);

					return acc;
				}, new Map()),
			);

			return conformed(value, result);
		}

		if (isPlainObject(value)) {
			const parent = value;

			const result = conform(
				Object.entries(value).reduce<Record<string, any>>(
					(acc, [key, value]) => {
						const result = deepTransform(value, {
							key: key,
							parent,
						});

						if (isCircularRef(result)) {
							circularReferences.set(value, {
								key: key,
								parent: acc,
							});
						}

						acc[key] = result;

						return acc;
					},
					Object.create(null),
				),
			);

			return conformed(value, result);
		}

		const result = conform(value, context);

		return conformed(value, result);
	};

	const result = deepTransform(value);

	return result;
};
