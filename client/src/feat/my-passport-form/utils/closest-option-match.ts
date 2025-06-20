import { closest } from "fastest-levenshtein";

export const closestOptionMatch = (
	value: string,
	options: Record<string, any>,
) => closest(value, Object.values(options));
