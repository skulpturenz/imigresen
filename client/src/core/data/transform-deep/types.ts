export interface ConformerContext {
	/**
	 * Defined for: arrays, plain objects, maps
	 */
	key?: string | number;
	parent: unknown;
}

export interface Conformer<T, U> {
	(value: T, context?: ConformerContext): U;
	match?: (value: unknown, context?: ConformerContext) => boolean;
}
