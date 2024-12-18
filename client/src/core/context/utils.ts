import { invariant } from "es-toolkit";
import { type Context, useContext as useSolidContext } from "solid-js";

export const useContext = <T>(context: Context<T>) => {
	const value = useSolidContext(context);

	invariant(value, "Context not defined");

	return value;
};
