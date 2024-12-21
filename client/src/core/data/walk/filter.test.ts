import { makeWalkBfs } from "core/data/walk";
import { partialRight } from "es-toolkit";
import { describe, expect, it } from "vitest";
import { makeFilter } from "./filter";
import { makeParents } from "./parents";
import type {
	Node,
	NodeWithGrandparents,
	Walk,
	WalkWithGrandparents,
} from "./types";

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

		const walkWithGrandparents = makeParents(walk);
		const walkWithFilterAndGrandparents = makeParents(
			partialRight(
				makeFilter(walk),
				({ node }: Node<Tree>) => node.hello === "world2",
			) as Walk<Tree>,
		);
		const walkWithGrandparentsAndFilter = makeFilter(
			makeParents(walk) as WalkWithGrandparents<Tree>,
		);

		// note: if there was no filter then there would be two items in `parents`
		expect(Array.from(walkWithFilterAndGrandparents(tree))).toHaveLength(1);
		expect(
			Array.from(walkWithGrandparents(tree)).find(
				({ node }) => node.hello === "world2",
			)?.parents.length,
		).toBeGreaterThan(
			Array.from(walkWithFilterAndGrandparents(tree))?.at(0)?.parents
				.length ?? 0,
		);

		expect(
			Array.from(
				walkWithGrandparentsAndFilter(
					tree,
					({ node }) => node.hello === "world2",
				),
			),
		).toHaveLength(1);
		expect(
			Array.from(walkWithGrandparents(tree)).find(
				({ node }) => node.hello === "world2",
			)?.parents.length,
		).toBe(
			(
				Array.from(
					walkWithGrandparentsAndFilter(
						tree,
						({ node }) => node.hello === "world2",
					),
				)?.at(0) as NodeWithGrandparents<Tree>
			)?.parents.length ?? 0,
		);
	});
});
