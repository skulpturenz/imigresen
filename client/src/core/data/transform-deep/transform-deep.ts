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
	const circularReferences = new Map();

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
			if (visited.has(value)) {
				const result = { __type: "circular", ref: null };
				circularReferences.set(value, result);

				return result;
			}

			visited.set(value, null);
		}

		if (Array.isArray(value)) {
			const parent = value;

			const result = conform(
				value.map((x, idx) => deepTransform(x, { key: idx, parent })),
			);

			visited.set(value, result);

			return result;
		}

		if (value instanceof Set) {
			const parent = value;

			const result = conform(
				new Set([...value].map(x => deepTransform(x, { parent }))),
			);

			visited.set(value, result);

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

			return result;
		}

		const result = conform(value, context);

		visited.set(value, result);

		return result;
	};

	const result = deepTransform(value);

	// TODO: can't think of a better way to handle this so that
	// we can just access the key on the final result and get the correct reference
	// need something outside from inside but we cannot determine outside without inside
	// using a proxy placeholder does not work and forwarding all prop access to ref does not work
	circularReferences.forEach((value, key) => {
		value.ref = visited.get(key);
	});

	return result;
};
