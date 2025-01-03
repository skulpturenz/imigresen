import type { RouteInternalProps, RouteProps } from "core/router/route";
import { isNil } from "es-toolkit";
import type { NavbarItem } from "../types";

export const sortNavigationRoutes = (
	a: RouteProps & RouteInternalProps,
	b: RouteProps & RouteInternalProps,
) => {
	// if sort order is specified then sort asc
	if (
		!isNil(a.meta?.navigationConfig?.sort) &&
		!isNil(b.meta?.navigationConfig?.sort)
	) {
		return a.meta.navigationConfig.sort - b.meta.navigationConfig.sort;
	}

	// otherwise by navigation config title asc
	if (a.meta?.navigationConfig?.title && b.meta?.navigationConfig?.title) {
		return a.meta.navigationConfig.title.localeCompare(
			b.meta.navigationConfig.title,
			undefined,
			{ sensitivity: "base" },
		);
	}

	// otherwise by page title asc
	if (a.title && b.title) {
		return a.title.localeCompare(b.title, undefined, {
			sensitivity: "base",
		});
	}

	// otherwise preserve order
	return 0;
};

export const sortNavbarItems = (a: NavbarItem, b: NavbarItem) =>
	sortNavigationRoutes(a.trigger, b.trigger);
