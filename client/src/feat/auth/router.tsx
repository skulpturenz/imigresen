import { AuthRoute } from "core/constants/auth-route.enum";
import { CoreRoute } from "core/constants/core-route.enum";
import type { RouterProps } from "core/router";
import { addRoutes, toPath, type RouteProps } from "core/router/route";
import { delay } from "es-toolkit";
import { lazy, type Component } from "solid-js";

export const Router: Component<RouterProps> = _props => {
	const routes = [
		{
			path: toPath(CoreRoute.Auth),
			children: [
				{
					path: toPath(AuthRoute.LoginCallback),
					component: lazy(() =>
						import("./login-callback").then(exports => ({
							default: exports.LoginCallback,
						})),
					),
					isAllowed: async () => {
						await delay(2000);

						return true;
					},
					isHidden: true,
				},
				{
					path: toPath(AuthRoute.LogoutCallback),
					component: lazy(() =>
						import("./logout-callback").then(exports => ({
							default: exports.LogoutCallback,
						})),
					),
					isAllowed: async () => {
						await delay(2000);

						return true;
					},
					isHidden: true,
				},
			],
			isHidden: true,
		},
	] as RouteProps[];

	return addRoutes(...routes);
};
