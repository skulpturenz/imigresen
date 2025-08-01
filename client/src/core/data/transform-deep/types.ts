export type TransformFn<T, U> = (value: T, key?: string | number, parent?: any) => U;

export type PrimitiveValue = string | number | boolean | null | undefined;

export type Transformable = 
	| PrimitiveValue
	| Record<string, any>
	| Array<any>
	| Set<any>
	| Map<any, any>;

export interface TransformOptions<T, U> {
	transform: TransformFn<T, U>;
	maxDepth?: number;
	preserveReferences?: boolean;
}