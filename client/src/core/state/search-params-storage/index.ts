import { isNotNil, isPrimitive } from "es-toolkit";
import { type StateStorage } from "zustand/middleware";

export const createSearchParamsStorage = (): StateStorage => {
	const getSearchParams = () =>
		new URLSearchParams(window.location.search.slice(1));

	return {
		getItem: (_): string => {
			return JSON.stringify(Object.fromEntries(getSearchParams()));
		},
		setItem: (_, newValue): void => {
			const parsedValue = JSON.parse(newValue);

			const isValuePersisted = (value: any) => {
				if (!isPrimitive(value)) {
					return false;
				}

				if (typeof value === "string" && value.trim() === "") {
					return false;
				}

				return isNotNil(value);
			};
			const updatedParams = new URLSearchParams([
				...Object.entries(getSearchParams()),
				...Object.entries(parsedValue.state).filter(([_key, value]) =>
					isValuePersisted(value),
				),
			]);

			history.replaceState(null, "", `?${updatedParams.toString()}`);
		},
		removeItem: (_): void => {
			history.replaceState(null, "", "?");
		},
	};
};
