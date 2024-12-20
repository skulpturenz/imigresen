export const makeWalkBfs = (getChildren: any, maxDepth = Infinity) =>
	function* walkBfs(
		start: any,
		next: any = [],
		currentDepth = 0,
		depthEnd = 0,
	): any {
		yield start;

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
				);
			}
		} else {
			if (currentDepth > maxDepth) {
				yield* walkBfs(
					next.at(0),
					next.slice(1),
					currentDepth,
					depthEnd - 1,
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
				);
			}
		}
	};
