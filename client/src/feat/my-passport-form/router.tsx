import { MyPassportForm } from "core/constants/my-passport-form-route.enum";
import { useI18n } from "core/context/i18n";
import type { RouterProps } from "core/router";
import { addRoutes, toPath, type RouteProps } from "core/router/route";
import { lazy, type Component } from "solid-js";
import { withI18n } from "./resources";
import type { resources } from "./resources/i18n/en-US";

export const Router: Component<RouterProps> = withI18n(_props => {
	const t = useI18n<typeof resources>();

	const routes = [
		{
			path: toPath(MyPassportForm.New),
			title: t("metaTitle"),
			component: lazy(() =>
				import("./my-passport-form").then(exports => ({
					default: withI18n(exports.MyPassportForm),
				})),
			),
			isHidden: true,
		},
	] as RouteProps[];

	return addRoutes(...routes);
});
