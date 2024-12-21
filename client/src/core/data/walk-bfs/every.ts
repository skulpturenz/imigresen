import type { Walk } from "./types";

export const makeEvery =
	<T>(walk: Walk<T>) =>
	(tree: T, predicate: (tree: T) => boolean) => {
		for (const { node } of walk(tree)) {
			if (!predicate(node)) {
				return false;
			}

			return true;
		}
	};
