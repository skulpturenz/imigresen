export interface ConformerContext {
	/**
	 * Defined for: arrays, plain objects, maps
	 */
	key?: string | number;
	parent: unknown;
}

export interface Conformer<T, U> {
	(value: T, context?: ConformerContext): U;
	match?: (value: T, context?: ConformerContext) => boolean;
}

export interface Transform<T = unknown, U = unknown> {
	(value: T, conformer: Conformer<T, U>): U;
	(value: T, conformer: Conformer<any, any>[]): U;
}

export type CircularReferentialResult<T extends Record<string, any>> = T & {
	__meta__?: {
		/**
		 * If true then circular references can be accessed via `ref`
		 *
		 * Circular references can be determined with `isCircularReference`
		 */
		hasCircularReference?: boolean;
	};
};
