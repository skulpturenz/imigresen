export interface WalkFactory<T> {
	(getChildren: (parent: T) => T[] | void, maxDepth?: number): Walk<T>;
	(getChildren: (parent: T) => T[] | void, maxDepth: number): Walk<T>;
}

export interface Walk<T> {
	(start: T): IterableIterator<Node<T>>;
}

export interface Node<T> {
	parent: T | null;
	node: T;
}

export interface NodeWithGrandparents<T> {
	parents: T[];
	node: T;
}
