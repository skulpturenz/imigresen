// TODO: types
export const makeWalkBfs = (getChildren: any, maxDepth = Infinity) =>
	function* walkBfs(
		start: any,
		next: any = [],
		currentDepth = 0,
		depthEndIdx = 0,
		parents: any = [],
	): any {
		yield { parent: parents.at(0) ?? null, node: start };

		const children = Object.values(getChildren(start) ?? []);

		if (!children.length && !next.length) {
			return;
		}

		if (!next.length) {
			if (currentDepth > maxDepth) {
				return;
			} else {
				yield* walkBfs(
					children.at(0),
					children.slice(1),
					!depthEndIdx ? currentDepth + 1 : currentDepth,
					Math.max(children.length - 1, 0),
					[
						...parents.slice(1),
						...Array(children.length).fill(start),
					],
				);
			}
		} else {
			if (currentDepth > maxDepth) {
				yield* walkBfs(
					next.at(0),
					next.slice(1),
					currentDepth,
					depthEndIdx - 1,
					[
						...parents.slice(1),
						...Array(children.length).fill(start),
					],
				);
			} else {
				yield* walkBfs(
					next.at(0),
					[...next.slice(1), ...children],
					!depthEndIdx ? currentDepth + 1 : currentDepth,
					depthEndIdx
						? depthEndIdx - 1
						: Math.max(next.length - 1, 0),
					[
						...parents.slice(1),
						...Array(children.length).fill(start),
					],
				);
			}
		}
	};
