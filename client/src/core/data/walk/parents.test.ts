import { makeWalkBfs } from "core/data/walk";
import { describe, expect, it } from "vitest";
import { makeParents } from "./parents";

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
