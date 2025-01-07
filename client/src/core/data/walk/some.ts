import type { GeneratorReturnType, Node, Walk } from "./types";

export const makeSome =
	<T, U extends Node<T>>(walk: Walk<T, U>) =>
	(
		tree: T,
		predicate: (
			node: GeneratorReturnType<ReturnType<typeof walk>>,
		) => boolean,
	) => {
		for (const result of walk(tree)) {
			if (predicate(result)) {
				return true;
			}
		}

		return false;
	};
