import { Navigate } from "@solidjs/router";
import { CoreRoute } from "core/constants/core-route.enum";
import { useI18n } from "core/context/i18n";
import type { RouterProps } from "core/router";
import { addRoutes, toPath, type RouteProps } from "core/router/route";
import { withParents } from "core/utils";
import { delay } from "es-toolkit";
import { type Component } from "solid-js";
import { HomeProvider } from "./context";
import { Home } from "./home";
import { withI18n } from "./resources";
import type { resources } from "./resources/i18n/en-US";

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
			component: withI18n(withParents(HomeProvider)(Home)),
			isAllowed: async () => {
				await delay(2000);

				return true;
			},
		},
	] as RouteProps[];

	return addRoutes(...routes);
});
