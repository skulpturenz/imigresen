export interface Conformer<T, U> {
	(value: T): U;
	match?: (value: T) => boolean;
}

export interface Transform<T = unknown, U = unknown> {
	(value: T, conformer: Conformer<T, U>): U;
	(value: T, conformer: Conformer<any, any>[]): U;
}
