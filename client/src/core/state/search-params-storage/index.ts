import { isNotNil, isPlainObject, isPrimitive } from "es-toolkit";
import { zipObjectDeep } from "es-toolkit/compat";
import { type StateStorage } from "zustand/middleware";

export const createSearchParamsStorage = (): StateStorage => {
	const getSearchParams = () =>
		new URLSearchParams(window.location.search.slice(1));

	const isValuePersisted = (value: any) => {
		if (!isPrimitive(value)) {
			return false;
		}

		if (typeof value === "string" && value.trim() === "") {
			return false;
		}

		return isNotNil(value);
	};

	const SEPARATOR = "_";

	return {
		getItem: (_): string => {
			const nest = (record: Record<string, any>): Record<string, any> => {
				if (!isPlainObject(record)) {
					return Object.create(null);
				}

				const keys = Object.keys(record).map(key =>
					key.replace(new RegExp(SEPARATOR, "g"), "."),
				);

				const values = Object.values(record).map(value => {
					try {
						return JSON.parse(value);
					} catch (_err: unknown) {
						return value;
					}
				});

				return zipObjectDeep(keys, values);
			};

			const state = nest(Object.fromEntries(getSearchParams()));

			return JSON.stringify({ state });
		},
		setItem: (_, newValue): void => {
			const parsedValue = JSON.parse(newValue);

			const flatten = (
				record: Record<string, any>,
				prefixKeys?: string[],
			): Record<string, any> => {
				if (!isPlainObject(record)) {
					return Object.create(null);
				}

				return Object.entries(record).reduce((acc, [key, value]) => {
					if (
						!isPlainObject(value) &&
						!Array.isArray(value) &&
						!isValuePersisted(value)
					) {
						return acc;
					}

					if (isPlainObject(value)) {
						return {
							...acc,
							...flatten(value, [...(prefixKeys ?? []), key]),
						};
					}

					return {
						...acc,
						[[...(prefixKeys ?? []), key].join(SEPARATOR)]:
							JSON.stringify(value),
					};
				}, Object.create(null));
			};

			const updatedParams = new URLSearchParams([
				...Object.entries(getSearchParams()),
				...Object.entries(flatten(parsedValue.state)),
			]);

			history.replaceState(null, "", `?${updatedParams.toString()}`);
		},
		removeItem: (_): void => {
			if (!import.meta.env.PROD) {
				console.warn("Clearing state will clear all search parameters");
			}

			history.replaceState(null, "", "?");
		},
	};
};
