import { Navigate } from "@solidjs/router";
import { CoreRoute } from "core/constants/core-route.enum";
import { makeWithI18n, useI18n } from "core/context/i18n";
import type { RouterProps } from "core/router";
import { addRoutes, toPath, type RouteProps } from "core/router/route";
import { withComponents } from "core/utils";
import { delay } from "es-toolkit";
import { type Component } from "solid-js";
import { HomeProvider } from "./context";
import { Home } from "./home";
import { fetcher } from "./resources";
import type { resources } from "./resources/i18n/en-US";

const withI18n = makeWithI18n({ fetcher });

export const Router: Component<RouterProps> = withI18n(_props => {
	const t = useI18n<typeof resources>();

	const HomeRedirect = () => <Navigate href={toPath(CoreRoute.Home)} />;

	const routes = [
		{
			path: "/",
			component: HomeRedirect,
			isHidden: true,
		},
		{
			path: ["/", toPath(CoreRoute.Home)],
			title: t("metaTitle"),
			component: withI18n(withComponents(HomeProvider)(Home)),
			isAllowed: async () => {
				await delay(2000);

				return true;
			},
		},
	] as RouteProps[];

	return addRoutes(...routes);
});
