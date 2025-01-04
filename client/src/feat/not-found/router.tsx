import { withI18n as _withI18n, useI18n } from "core/context/i18n";
import type { RouterProps } from "core/router";
import { addRoutes, type RouteProps } from "core/router/route";
import { NotFound } from "feat/not-found/not-found";
import { type Component } from "solid-js";
import { fetcher } from "./resources";
import type { resources } from "./resources/i18n/en-US";

const withI18n = _withI18n({ fetcher });

export const Router: Component<RouterProps> = withI18n(_props => {
	const t = useI18n<typeof resources>();

	const routes = [
		{
			path: "*path",
			title: t("metaTitle"),
			component: withI18n(NotFound),
			isHidden: true,
		},
	] as RouteProps[];

	return addRoutes(...routes);
});
