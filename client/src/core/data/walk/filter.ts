import type { GeneratorReturnType, Node, Walk } from "./types";

export const makeFilter = <T, U extends Node<T>>(walk: Walk<T, U>) =>
	function* filter(
		tree: T,
		predicate: (
			node: GeneratorReturnType<ReturnType<typeof walk>>,
		) => boolean,
	) {
		for (const result of walk(tree)) {
			if (!predicate(result)) {
				continue;
			}

			yield result;
		}
	};
