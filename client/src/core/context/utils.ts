import { invariant } from "es-toolkit";
import type { Context } from "solid-js";
import { useContext as useSolidContext } from "solid-js";

export const useContext = <T extends any>(context: Context<T>) => {
	const value = useSolidContext(context);

	invariant(value, "Context not defined");

	return value;
};
