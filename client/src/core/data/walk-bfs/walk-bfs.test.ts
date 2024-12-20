import { describe, expect, it } from "vitest";
import { makeWalkBfs } from ".";

describe("walk-bfs", () => {
	it("walks a tree breadth first", () => {
		const tree = {
			hello: "world",
			children: [
				{
					hello: "world1",
					children: [
						{
							hello: "world2",
						},
					],
				},
				{
					hello: "world3",
					children: [
						{
							hello: "world4",
							children: [
								{
									hello: "world5",
									children: [
										{
											hello: "world6",
											children: [
												{
													hello: "world7",
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

		const walk = makeWalkBfs((record: any) => record.children);
		const visited = new Set();

		for (const node of walk(tree)) {
			visited.add(node.hello);
		}

		expect([...visited]).toEqual([
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

	it.todo("limits depth");

	it.todo("yields the parent node");
});