import type { RouteInternalProps, RouteProps } from "core/router/route";
import { sortNavigationRoutes } from "core/ui/shell/utils";
import { describe, expect, it } from "vitest";

describe("sortNavigationRoutes", () => {
	it("sorts by sort order asc", () => {
		const routes: (RouteProps & RouteInternalProps)[] = [
			{
				meta: {
					navigationConfig: {
						sort: 1,
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						sort: 0,
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						sort: 3,
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						sort: 2,
					},
				},
			},
		];

		const sorted = [...routes].sort(sortNavigationRoutes);

		expect(sorted.map(route => route.meta?.navigationConfig?.sort)).toEqual(
			Array.from({ length: 4 }, (_, idx) => idx),
		);
	});

	it("sorts by navigation config title asc", () => {
		const routes: (RouteProps & RouteInternalProps)[] = [
			{
				meta: {
					navigationConfig: {
						title: "B",
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						title: "a",
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						title: "E",
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						title: "d",
					},
				},
			},
		];

		const sorted = [...routes].sort(sortNavigationRoutes);

		expect(
			sorted.map(route => route.meta?.navigationConfig?.title),
		).toEqual(["a", "B", "d", "E"]);
	});

	it("sorts by page title asc", () => {
		const routes: (RouteProps & RouteInternalProps)[] = [
			{
				title: "B",
			},
			{
				title: "a",
			},
			{
				title: "E",
			},
			{
				title: "d",
			},
		];

		const sorted = [...routes].sort(sortNavigationRoutes);

		expect(sorted.map(route => route.title)).toEqual(["a", "B", "d", "E"]);
	});

	it("preserves order otherwise", () => {
		const routes: (RouteProps & RouteInternalProps)[] = [
			{
				meta: {
					navigationConfig: {
						description: "b",
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						description: "a",
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						description: "d",
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						description: "c",
					},
				},
			},
		];

		const sorted = [...routes].sort(sortNavigationRoutes);

		expect(
			sorted.map(route => route.meta?.navigationConfig?.description),
		).toEqual(["b", "a", "d", "c"]);
	});

	it("mixed case", () => {
		const routes: (RouteProps & RouteInternalProps)[] = [
			{
				meta: {
					navigationConfig: {
						sort: 1,
						description: "b",
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						sort: 0,
						description: "a",
					},
				},
			},
			{
				meta: {
					navigationConfig: {
						title: "B",
					},
				},
			},
			{
				title: "Hello",
				meta: {
					navigationConfig: {
						title: "c",
					},
				},
			},
			{
				title: "World",
			},
			{
				title: "Apply",
			},
			{
				meta: {
					navigationConfig: {
						description: "Last",
					},
				},
			},
		];

		const sorted = [...routes].sort(sortNavigationRoutes);

		expect(sorted.at(0)).toEqual(routes.at(1));
		expect(sorted.at(1)).toEqual(routes.at(0));
		expect(sorted.at(2)).toEqual(routes.at(2));
		expect(sorted.at(3)).toEqual(routes.at(5));
		expect(sorted.at(4)).toEqual(routes.at(3));
		expect(sorted.at(5)).toEqual(routes.at(4));
		expect(sorted.at(6)).toEqual(routes.at(6));
	});
});
