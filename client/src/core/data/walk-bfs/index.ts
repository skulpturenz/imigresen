// TODO: types
export const makeWalkBfs = (getChildren: any, maxDepth = Infinity) =>
	function* walkBfs(
		start: any,
		next: any = [],
		currentDepth = 0,
		depthEnd = 0,
		parents: any = [],
	): any {
		yield { parent: parents.at(0) ?? null, node: start };

		const children = getChildren(start) ?? [];

		if (!Object.values(children).length && !next.length) {
			return;
		}

		if (!next.length) {
			if (currentDepth > maxDepth) {
				return;
			} else {
				yield* walkBfs(
					Object.values(children).at(0),
					Object.values(children).slice(1),
					!depthEnd ? currentDepth + 1 : currentDepth,
					Object.values(children).slice(1).length,
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
					depthEnd - 1,
					[
						...parents.slice(1),
						...Array(children.length).fill(start),
					],
				);
			} else {
				yield* walkBfs(
					next.at(0),
					[...next.slice(1), ...Object.values(children)],
					!depthEnd ? currentDepth + 1 : currentDepth,
					depthEnd ? depthEnd - 1 : next.slice(1).length,
					[
						...parents.slice(1),
						...Array(children.length).fill(start),
					],
				);
			}
		}
	};
