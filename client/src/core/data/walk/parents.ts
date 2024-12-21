import type { NodeWithGrandparents, Walk } from "./types";

export const makeParents = <T>(walk: Walk<T>) =>
	function* parents(tree: T): IterableIterator<NodeWithGrandparents<T>> {
		const parentsMap = new Map<T, T[]>();

		const getGrandparents = (parent: T | null) => {
			if (!parent) {
				return [];
			}

			return (parentsMap.get(parent) ?? []) as T[];
		};

		for (const { node, parent } of walk(tree)) {
			const parents: T[] = [...getGrandparents(parent)];

			if (parent) {
				parents.push(parent);
			}

			parentsMap.set(node, parents);

			yield { parents, node };
		}
	};
