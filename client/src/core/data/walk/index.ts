import type { Node, Walk } from "./types";

export const makeWalkBfs = <T>(
	getChildren: (parent: T) => T[] | void,
	maxDepth = Infinity,
): Walk<T> =>
	function* walkBfs(
		start: T,
		next: T[] = [],
		parents: T[] = [],
		currentDepth = 0,
		depthEndIdx = 0,
	): IterableIterator<Node<T>> {
		yield { parent: parents.at(0) ?? null, node: start };

		const children = Object.values(getChildren(start) ?? []) as T[];

		if (!children.length && !next.length) {
			return;
		}

		if (!next.length) {
			if (currentDepth > maxDepth) {
				return;
			} else {
				yield* walkBfs(
					children.at(0) as T,
					children.slice(1),
					[
						...parents.slice(1),
						...Array(children.length).fill(start),
					],
					!depthEndIdx ? currentDepth + 1 : currentDepth,
					Math.max(children.length - 1, 0),
				);
			}
		} else {
			if (currentDepth > maxDepth) {
				yield* walkBfs(
					next.at(0) as T,
					next.slice(1),
					[
						...parents.slice(1),
						...Array(children.length).fill(start),
					],
					currentDepth,
					depthEndIdx - 1,
				);
			} else {
				yield* walkBfs(
					next.at(0) as T,
					[...next.slice(1), ...children],
					[
						...parents.slice(1),
						...Array(children.length).fill(start),
					],
					!depthEndIdx ? currentDepth + 1 : currentDepth,
					depthEndIdx
						? depthEndIdx - 1
						: Math.max(next.length - 1, 0),
				);
			}
		}
	};
