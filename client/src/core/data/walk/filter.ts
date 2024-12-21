import type { Node, Walk } from "./types";

export const makeFilter = <T>(walk: Walk<T>) =>
	function* filter(tree: T, predicate: (node: Node<T>) => boolean) {
		for (const result of walk(tree)) {
			if (!predicate(result)) {
				continue;
			}

			yield result;
		}

		return false;
	};
