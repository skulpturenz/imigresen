import { CoreRoute } from "core/constants/core-route.enum";
import { useI18n } from "core/context/i18n";
import type { RouterProps } from "core/router";
import { addRoutes, type RouteProps } from "core/router/route";
import { toPath } from "core/router/utils";
import { lazy, type Component } from "solid-js";
import { withI18n } from "./resources";
import type { resources } from "./resources/i18n/en-us";

export const Router: Component<RouterProps> = withI18n(_props => {
	const t = useI18n<typeof resources>();

	const routes = [
		{
			path: toPath(CoreRoute.Unauthorized),
			title: t("metaTitle"),
			component: lazy(() =>
				import("./unauthorized").then(exports => ({
					default: withI18n(exports.Unauthorized),
				})),
			),
			isHidden: true,
		},
	] as RouteProps[];

	return addRoutes(...routes);
});
