import type { NodeWithParent, WalkWithParent } from "./types";

export const makeWalkBfs = <T>(
	getChildren: (parent: T) => T[] | void,
	maxDepth = Infinity,
): WalkWithParent<T> =>
	function* walkBfs(
		start: T,
		next: T[] = [],
		parents: T[] = [],
		currentDepth = 0,
		depthEndIdx = 0,
	): IterableIterator<NodeWithParent<T>> {
		yield { parent: parents.at(0) ?? null, node: start };

		const children = Object.values(getChildren(start) ?? []) as T[];

		if (!children.length && !next.length) {
			return;
		}

		if (!next.length && currentDepth > maxDepth) {
			return;
		}

		if (!next.length && currentDepth <= maxDepth) {
			yield* walkBfs(
				children.at(0) as T,
				children.slice(1),
				[...parents.slice(1), ...Array(children.length).fill(start)],
				!depthEndIdx ? currentDepth + 1 : currentDepth,
				Math.max(children.length - 1, 0),
			);
		}

		if (next.length && currentDepth > maxDepth) {
			yield* walkBfs(
				next.at(0) as T,
				next.slice(1),
				[...parents.slice(1), ...Array(children.length).fill(start)],
				currentDepth,
				depthEndIdx - 1,
			);
		}

		if (next.length && currentDepth <= maxDepth) {
			yield* walkBfs(
				next.at(0) as T,
				[...next.slice(1), ...children],
				[...parents.slice(1), ...Array(children.length).fill(start)],
				!depthEndIdx ? currentDepth + 1 : currentDepth,
				depthEndIdx ? depthEndIdx - 1 : Math.max(next.length - 1, 0),
			);
		}
	};
