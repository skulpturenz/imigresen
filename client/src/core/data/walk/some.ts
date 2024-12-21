import type { Node, Walk } from "./types";

export const makeSome =
	<T>(walk: Walk<T>) =>
	(tree: T, predicate: (node: Node<T>) => boolean) => {
		for (const result of walk(tree)) {
			if (predicate(result)) {
				return true;
			}
		}

		return false;
	};
