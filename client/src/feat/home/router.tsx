import { Navigate } from "@solidjs/router";
import { CoreRoute } from "core/constants/core-route.enum";
import type { RouterProps } from "core/router";
import { addRoutes, toPath, type RouteProps } from "core/router/route";
import { delay } from "es-toolkit";
import { type Component } from "solid-js";
import { Home } from "./home";
import { resources } from "./resources";

export const Router: Component<RouterProps> = _props => {
	const HomeRedirect = () => <Navigate href={toPath(CoreRoute.Home)} />;

	const routes = [
		{
			path: "/",
			component: HomeRedirect,
		},
		{
			path: toPath(CoreRoute.Home),
			title: resources.pageTitle,
			component: Home,
			isAllowed: async () => {
				await delay(2000);

				return true;
			},
		},
	] as RouteProps[];

	return addRoutes(...routes);
};
