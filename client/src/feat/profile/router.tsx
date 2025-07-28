import { UserRoute } from "core/constants/user-route.enum";
import { useI18n } from "core/context/i18n";
import type { RouterProps } from "core/router";
import { addRoutes, type RouteProps } from "core/router/route";
import { toPath } from "core/router/utils";
import { withParents } from "core/utils";
import { lazy, type Component } from "solid-js";
import { withI18n } from "./resources";
import type { resources } from "./resources/i18n/en-us";

export const Router: Component<RouterProps> = withI18n(_props => {
	const t = useI18n<typeof resources>();

	const routes = [
		{
			path: toPath(UserRoute.Profile),
			title: t("metaTitle"),
			component: lazy(async () => {
				const { ProfileProvider } = await import("./context");

				return import("./profile").then(exports => ({
					default: withI18n(
						withParents(ProfileProvider)(exports.Profile),
					),
				}));
			}),
			isHidden: true,
		},
	] as RouteProps[];

	return addRoutes(...routes);
});
