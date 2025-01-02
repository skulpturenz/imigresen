import type { RouteInternalProps, RouteProps } from "core/router/route";
import { invariant } from "es-toolkit";
import { createWithSignal } from "solid-zustand";

export interface RouterSvc {
	routes: Record<string, RouteProps & RouteInternalProps>;
	actions: {
		appendRoute: (route: RouteProps & RouteInternalProps) => void;
		getRoute: (path: string) => RouteProps;
	};
}

export const useStore = createWithSignal<RouterSvc>((set, get) => ({
	routes: Object.create(null),
	actions: {
		appendRoute: route => {
			invariant(
				route.info?.hrefPath,
				"Missing `hrefPath` - route configured incorrectly",
			);

			set({ routes: { ...get().routes, [route.info?.hrefPath]: route } });

			// only nested routes
			if (
				(Array.isArray(route.path) &&
					!route.path.some(path => path === route.info?.hrefPath)) ||
				(!Array.isArray(route.path) &&
					route.info.hrefPath !== route.path)
			) {
				const root = route.info.hrefPath
					.split(/\//)
					.slice(0, 2)
					.join("/");

				const getChildren = (
					route: RouteProps & RouteInternalProps,
				) => {
					if (Array.isArray(route.children)) {
						return route.children;
					}

					if (route.children) {
						return [route.children];
					}

					return [];
				};

				set({
					routes: {
						...get().routes,
						[root]: {
							...get().routes[root],
							children: [
								...getChildren(get().routes[root]),
								route,
							],
						},
					},
				});
			}
		},
		getRoute: path => {
			const route = get().routes[path];

			invariant(route, `No route matching path ${path}`);

			return route;
		},
	},
}));
