import { describe, expect, it } from "vitest";
import { makeWalkBfs } from ".";

describe("walk-bfs", () => {
	const tree = {
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
		const walk = makeWalkBfs((record: any) => record.children);

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
		const walk = makeWalkBfs((record: any) => record.children, 3);

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
		const walk = makeWalkBfs((record: any) => record.children);

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
