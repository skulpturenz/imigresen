export const makeWalkBfs = (getChildren: any) =>
	function* walkBfs(start: any, next: any = []): any {
		yield start;

		if (!Object.values(getChildren(start)).length && !next.length) {
			return;
		}

		if (!next.length) {
			yield* walkBfs(Object.values(getChildren(start)).at(0), [
				...Object.values(getChildren(start)).slice(1),
			]);
		} else {
			yield* walkBfs(next.at(0), [
				...next.slice(1),
				...Object.values(getChildren(start)),
			]);
		}
	};
