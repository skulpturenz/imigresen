import { makeWalkBfs } from "core/data/walk";
import { describe, expect, it } from "vitest";
import { makeEvery } from "./every";
import { makeParents } from "./parents";
import { makeSome } from "./some";

describe("walk-bfs", () => {
	interface Tree {
		hello: string;
		children?: Tree[];
	}

	const tree: Tree = {
		hello: "world", // depth = 0
		children: [
			{
				hello: "world1", // depth = 1
				children: [
					{
						hello: "world2", // depth = 2
					},
				],
			},
			{
				hello: "world3", // depth = 1
				children: [
					{
						hello: "world4", // depth = 2
						children: [
							{
								hello: "world5", // depth = 3
								children: [
									{
										hello: "world6", // depth = 4
										children: [
											{
												hello: "world7", // depth = 5
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	};

	it("walks a tree breadth first", () => {
		const walk = makeWalkBfs((tree: Tree) => tree.children);

		expect(Array.from(walk(tree), ({ node }) => node.hello)).toEqual([
			"world",
			"world1",
			"world3",
			"world2",
			"world4",
			"world5",
			"world6",
			"world7",
		]);
	});

	it("limits depth", () => {
		const walk = makeWalkBfs((tree: Tree) => tree.children, 3);

		expect(Array.from(walk(tree), ({ node }) => node.hello)).toEqual([
			"world",
			"world1",
			"world3",
			"world2",
			"world4",
			"world5",
		]);
	});

	it("yields the parent node", () => {
		const walk = makeWalkBfs((tree: Tree) => tree.children);

		const nodeParents = {
			world: null,
			world1: "world",
			world3: "world",
			world2: "world1",
			world4: "world3",
			world5: "world4",
			world6: "world5",
			world7: "world6",
		};

		expect(Object.values(nodeParents)).toEqual(
			Array.from(walk(tree), ({ parent }) => parent?.hello ?? null),
		);
	});
});

describe("parents", () => {
	interface Tree {
		hello: string;
		children?: Tree[];
	}

	const tree: Tree = {
		hello: "world", // depth = 0
		children: [
			{
				hello: "world1", // depth = 1
				children: [
					{
						hello: "world2", // depth = 2
					},
				],
			},
			{
				hello: "world3", // depth = 1
				children: [
					{
						hello: "world4", // depth = 2
						children: [
							{
								hello: "world5", // depth = 3
								children: [
									{
										hello: "world6", // depth = 4
										children: [
											{
												hello: "world7", // depth = 5
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	};

	it("has all parents for a node", () => {
		const walk = makeWalkBfs((tree: Tree) => tree.children);
		const parents = makeParents(walk);

		const nodeParents = {
			world: 0,
			world1: 1,
			world3: 1,
			world2: 2,
			world4: 2,
			world5: 3,
			world6: 4,
			world7: 5,
		};

		expect(Object.values(nodeParents)).toEqual(
			Array.from(parents(tree), ({ parents }) => parents.length),
		);
	});
});

describe("some", () => {
	interface Tree {
		hello: string;
		children?: Tree[];
	}

	const tree: Tree = {
		hello: "world", // depth = 0
		children: [
			{
				hello: "world1", // depth = 1
				children: [
					{
						hello: "world2", // depth = 2
					},
				],
			},
			{
				hello: "world3", // depth = 1
				children: [
					{
						hello: "world4", // depth = 2
						children: [
							{
								hello: "world5", // depth = 3
								children: [
									{
										hello: "world6", // depth = 4
										children: [
											{
												hello: "world7", // depth = 5
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	};

	it("true if predicate is truthy for some node", () => {
		const walk = makeWalkBfs((tree: Tree) => tree.children);
		const some = makeSome(walk);

		expect(some(tree, node => node.hello === "world3")).toBeTruthy();
		expect(some(tree, node => node.hello === "world8")).toBeFalsy();
	});
});

describe("every", () => {
	interface Tree {
		hello: string;
		children?: Tree[];
	}

	const tree: Tree = {
		hello: "world", // depth = 0
		children: [
			{
				hello: "world1", // depth = 1
				children: [
					{
						hello: "world2", // depth = 2
					},
				],
			},
			{
				hello: "world3", // depth = 1
				children: [
					{
						hello: "world4", // depth = 2
						children: [
							{
								hello: "world5", // depth = 3
								children: [
									{
										hello: "world6", // depth = 4
										children: [
											{
												hello: "world7", // depth = 5
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	};

	it("false if predicate is true for every node", () => {
		const walk = makeWalkBfs((tree: Tree) => tree.children);
		const every = makeEvery(walk);

		expect(every(tree, node => Boolean(node.hello))).toBeTruthy();
		expect(every(tree, node => node.hello === "world3")).toBeFalsy();
	});
});