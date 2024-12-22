import type { GeneratorReturnType, Node, Walk } from "./types";

export const makeEvery =
	<T, U extends Node<T>>(walk: Walk<T, U>) =>
	(
		tree: T,
		predicate: (
			tree: GeneratorReturnType<ReturnType<typeof walk>>,
		) => boolean,
	) => {
		for (const result of walk(tree)) {
			if (!predicate(result)) {
				return false;
			}
		}

		return true;
	};
