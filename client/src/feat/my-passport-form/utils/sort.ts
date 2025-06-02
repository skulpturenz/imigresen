export type Sorter<T = unknown> = (a: T, b: T) => number;

export const multiSort =
	<T>(...sorters: Sorter<T>[]) =>
	(a: T, b: T) => {
		const EQUAL = 0;

		for (const sorter of sorters) {
			const sort = sorter(a, b);

			if (sort !== EQUAL) {
				return sort;
			}
		}

		return EQUAL;
	};

export const flip =
	<T>(sorter: Sorter<T>) =>
	(a: T, b: T) =>
		-1 * sorter(a, b);

export const localeAsc = (a: string, b: string) =>
	a.localeCompare(b, undefined, { sensitivity: "base" });

export const asc = (a: number, b: number) => a - b;

export const get =
	<T, U>(getter: (item: T) => U) =>
	(sorter: Sorter<U>) =>
	(a: T, b: T) =>
		sorter(getter(a), getter(b));
