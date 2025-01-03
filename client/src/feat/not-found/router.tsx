import { withI18n } from "core/context/i18n";
import type { RouterProps } from "core/router";
import { addRoutes, type RouteProps } from "core/router/route";
import { NotFound } from "feat/not-found/not-found";
import { type Component } from "solid-js";
import { resources } from "./resources";

export const Router: Component<RouterProps> = _props => {
	const routes = [
		{
			path: "*path",
			title: resources.metaTitle,
			// TODO
			component: withI18n({
				fetcher: () => Promise.resolve(Object.create(null)),
			})(NotFound),
			isHidden: true,
		},
	] as RouteProps[];

	return addRoutes(...routes);
};
