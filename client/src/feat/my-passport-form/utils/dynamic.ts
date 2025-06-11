import { invariant } from "es-toolkit";

type DynamicEnum<E, D extends Record<keyof E, any>> = Record<
	keyof E,
	D[keyof E]
>;

export const dynamic = <
	E extends Record<string, any>,
	D extends Record<keyof E, any>,
>(
	dynamicEnum: E,
	data: D,
	reverseMap = true,
): DynamicEnum<E, D> => {
	const hasDuplicateValues =
		new Set(Object.values(data)).size !== Object.values(data).length;

	const reduced = Object.keys(dynamicEnum).reduce((acc, key) => {
		// typescript enums have reverse mappings if its values are numbers
		if (!Number.isNaN(Number(key))) {
			return acc;
		}

		invariant(
			data[key],
			`Key ${key} is present in static definition but not the dynamic definition`,
		);

		if (!hasDuplicateValues && reverseMap) {
			return {
				...acc,
				[key]: data[key],
				[data[key]]: key,
			};
		}

		return {
			...acc,
			[key]: data[key],
		};
	}, Object.create(null));

	return reduced;
};
