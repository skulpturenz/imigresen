import type { Walk } from "./types";

export const makeSome =
	<T>(walk: Walk<T>) =>
	(tree: T, predicate: (tree: T) => boolean) => {
		for (const { node } of walk(tree)) {
			if (predicate(node)) {
				return true;
			}

			return false;
		}
	};
