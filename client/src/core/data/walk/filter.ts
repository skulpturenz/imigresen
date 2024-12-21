import type {
	Node,
	NodeWithGrandparents,
	Walk,
	WalkWithGrandparents,
} from "./types";

export const makeFilter = <T>(walk: Walk<T> | WalkWithGrandparents<T>) =>
	function* filter(
		tree: T,
		predicate: (node: Node<T> | NodeWithGrandparents<T>) => boolean,
	) {
		for (const result of walk(tree)) {
			if (!predicate(result)) {
				continue;
			}

			yield result;
		}
	};
