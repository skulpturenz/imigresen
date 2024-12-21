import type { Node, Walk } from "./types";

export const makeEvery =
	<T>(walk: Walk<T>) =>
	(tree: T, predicate: (tree: Node<T>) => boolean) => {
		for (const result of walk(tree)) {
			if (!predicate(result)) {
				return false;
			}
		}

		return true;
	};
