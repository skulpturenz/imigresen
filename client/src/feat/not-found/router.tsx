import { withI18n } from "core/context/i18n";
import type { RouterProps } from "core/router";
import { addRoutes, type RouteProps } from "core/router/route";
import { NotFound } from "feat/not-found/not-found";
import { type Component } from "solid-js";
import { fetcher } from "./resources";
import { resources } from "./resources/i18n/en-US";

export const Router: Component<RouterProps> = _props => {
	const routes = [
		{
			path: "*path",
			title: resources.metaTitle,
			component: withI18n({
				fetcher: fetcher,
			})(NotFound),
			isHidden: true,
		},
	] as RouteProps[];

	return addRoutes(...routes);
};
