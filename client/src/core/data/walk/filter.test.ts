import { makeWalkBfs } from "core/data/walk";
import { partialRight } from "es-toolkit";
import { describe, expect, it } from "vitest";
import { makeFilter } from "./filter";
import { makeParents } from "./parents";
import type { Node } from "./types";

describe("filter", () => {
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

	it("filters nodes from the tree", () => {
		const walk = makeWalkBfs((tree: Tree) => tree.children);
		const filter = makeFilter(walk);

		expect(
			Array.from(filter(tree, ({ node }) => node.hello === "world1")),
		).toHaveLength(1);
	});

	it("returns a `Walk`", () => {
		const walk = makeWalkBfs((tree: Tree) => tree.children);
		const walkWithFilter = partialRight(
			makeFilter(walk),
			({ node }: Node<Tree>) => node.hello === "world2",
		);
		const walkWithGrandparents = makeParents(walkWithFilter);

		expect(Array.from(walkWithGrandparents(tree))).toHaveLength(1);
		// note: if there was no filter then there would be two items in `parents`
		expect(
			Array.from(walkWithGrandparents(tree))?.at(0)?.parents,
		).toHaveLength(1);
	});
});
