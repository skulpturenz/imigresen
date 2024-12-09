import type { Context } from "solid-js";
import { useContext as useSolidContext } from "solid-js";

export const useContext = (context: Context<any>) => {
	const value = useSolidContext(context);

	if (!value) {
		throw new Error("Context not defined");
	}

	return value;
};
