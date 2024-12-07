import { CoreRoute } from "core/constants/core-route.enum";
import { addRoutes, toPath, type RouteProps } from "core/router/route";
import { type Component } from "solid-js";
import type { RouterProps } from "../../core/router";
import { Home } from "./home";
import { resources } from "./resources";

export const Router: Component<RouterProps> = _props => {
	const routes = [
		{
			path: toPath(CoreRoute.Home),
			title: resources.pageTitle,
			component: Home,
			isAllowed: () => true,
		},
	] as RouteProps[];

	return addRoutes(...routes);
};
