export interface WalkFactory<T, U extends Node<T> = Node<T>> {
	(getChildren: (parent: T) => T[] | void, maxDepth?: number): Walk<T, U>;
	(getChildren: (parent: T) => T[] | void, maxDepth: number): Walk<T, U>;
}

export interface Walk<T, U extends Node<T> = Node<T>> {
	(start: T): IterableIterator<U>;
}

export interface WalkWithParent<T> {
	(start: T): IterableIterator<NodeWithParent<T>>;
}

export interface WalkWithGrandparents<T> {
	(start: T): IterableIterator<NodeWithGrandparents<T>>;
}

export interface Node<T> {
	node: T;
}

export interface NodeWithParent<T> {
	parent: T | null;
	node: T;
}

export interface NodeWithGrandparents<T> {
	parents: T[];
	node: T;
}

export type GeneratorReturnType<T extends IterableIterator<any>> =
	T extends IterableIterator<infer I> ? I : never;
