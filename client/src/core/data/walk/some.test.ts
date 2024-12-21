import { makeWalkBfs } from "core/data/walk";
import { describe, expect, it } from "vitest";
import { makeSome } from "./some";

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
