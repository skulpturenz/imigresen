import { AuthRoute } from "core/constants/auth-route.enum";
import { CoreRoute } from "core/constants/core-route.enum";
import type { RouterProps } from "core/router";
import { addRoutes, toPath, type RouteProps } from "core/router/route";
import { delay } from "es-toolkit";
import { type Component } from "solid-js";
import { LoginCallback } from "./login-callback";
import { LogoutCallback } from "./logout-callback";

export const Router: Component<RouterProps> = _props => {
	const routes = [
		{
			path: toPath(CoreRoute.Auth, AuthRoute.LoginCallback),
			component: LoginCallback,
			isAllowed: async () => {
				await delay(2000);

				return true;
			},
		},
		{
			path: toPath(CoreRoute.Auth, AuthRoute.LogoutCallback),
			component: LogoutCallback,
			isAllowed: async () => {
				await delay(2000);

				return true;
			},
		},
	] as RouteProps[];

	return addRoutes(...routes);
};
