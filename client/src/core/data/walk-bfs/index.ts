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

		if (!Object.values(getChildren(start) ?? []).length && !next.length) {
			return;
		}

		if (!next.length) {
			if (currentDepth > maxDepth) {
				return;
			} else {
				yield* walkBfs(
					Object.values(getChildren(start) ?? []).at(0),
					Object.values(getChildren(start) ?? []).slice(1),
					!depthEnd ? currentDepth + 1 : currentDepth,
					Object.values(getChildren(start) ?? []).slice(1).length,
					[
						...parents.slice(1),
						...Array.from(
							{ length: (getChildren(start) ?? []).length },
							() => start,
						),
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
						...Array.from(
							{ length: (getChildren(start) ?? []).length },
							() => start,
						),
					],
				);
			} else {
				yield* walkBfs(
					next.at(0),
					[
						...next.slice(1),
						...Object.values(getChildren(start) ?? []),
					],
					!depthEnd ? currentDepth + 1 : currentDepth,
					depthEnd ? depthEnd - 1 : next.slice(1).length,
					[
						...parents.slice(1),
						...Array.from(
							{ length: (getChildren(start) ?? []).length },
							() => start,
						),
					],
				);
			}
		}
	};
