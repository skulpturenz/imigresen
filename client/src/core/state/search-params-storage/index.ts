import { type StateStorage } from "zustand/middleware";

export const createSearchParamsStorage = (): StateStorage => {
	const getSearchParams = () =>
		new URLSearchParams(window.location.search.slice(1));

	return {
		getItem: (_): string => {
			return JSON.stringify(Object.fromEntries(getSearchParams()));
		},
		setItem: (_, newValue): void => {
			const parsedValue = JSON.parse(JSON.stringify(newValue));

			const updatedParams = new URLSearchParams({
				...Object.fromEntries(getSearchParams()),
				...parsedValue,
			});

			history.replaceState(null, "", `?${updatedParams.toString()}`);
		},
		removeItem: (_): void => {
			history.replaceState(null, "", "?");
		},
	};
};
