import type { Context } from "solid-js";
import { useContext as useSolidContext } from "solid-js";

export const useContext = <T extends any>(context: Context<T>) => {
	const value = useSolidContext(context);

	if (!value) {
		throw new Error("Context not defined");
	}

	return value;
};
