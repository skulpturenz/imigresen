export type TransformFn<T, U> = (
	value: T,
	key?: string | number,
	parent?: any,
) => U;

export type PrimitiveValue = string | number | boolean | null | undefined;

export type Transformable =
	| PrimitiveValue
	| Record<string, any>
	| Array<any>
	| Set<any>
	| Map<any, any>;

export interface PredicateTransform<T, U> {
	predicate: (value: any, key?: string | number, parent?: any) => boolean;
	transform: TransformFn<T, U>;
}

export interface TransformOptions<T, U> {
	transform?: TransformFn<T, U>;
	transforms?: PredicateTransform<T, U>[];
	defaultTransform?: TransformFn<T, U>;
	maxDepth?: number;
	preserveReferences?: boolean;
}
