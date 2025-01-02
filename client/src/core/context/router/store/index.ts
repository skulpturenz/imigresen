import type { RouteInternalProps, RouteProps } from "core/router/route";
import { invariant } from "es-toolkit";
import { createWithSignal } from "solid-zustand";

const ROUTES_LOADED_MASK = 0x0;

export interface RouterSvc {
	routes: Record<string, RouteProps & RouteInternalProps>;
	isInitialLoading: () => boolean;
	actions: {
		getNextMask: () => number;
		appendRoute: (route: RouteProps & RouteInternalProps) => void;
		getRoute: (path: string) => RouteProps;
	};
}

export interface RouterInternalSvc {
	routesLoadingMask: number;
}

export const useStore = createWithSignal<RouterSvc & RouterInternalSvc>(
	(set, get) => {
		const routeMaskSequence = routeMaskGenerator();

		return {
			routes: Object.create(null),
			isInitialLoading: () =>
				get().routesLoadingMask !== ROUTES_LOADED_MASK,
			routesLoadingMask: ROUTES_LOADED_MASK,
			actions: {
				getNextMask: () => {
					const mask = routeMaskSequence.next().value as number;

					set({ routesLoadingMask: get().routesLoadingMask ^ mask });

					return mask;
				},
				appendRoute: route => {
					invariant(
						route.info?.mask,
						"Missing `mask` - route configured incorrectly",
					);
					invariant(
						route.info?.hrefPath,
						"Missing `hrefPath` - route configured incorrectly",
					);

					set({
						routes: {
							...get().routes,
							[route.info?.hrefPath]: route,
						},
					});

					const isNestedRoute = (
						route: RouteProps & RouteInternalProps,
					) =>
						(Array.isArray(route.path) &&
							!route.path.some(
								path => path === route.info?.hrefPath,
							)) ||
						(!Array.isArray(route.path) &&
							route.info?.hrefPath !== route.path);

					if (isNestedRoute(route)) {
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

					set({
						routesLoadingMask:
							get().routesLoadingMask ^ route.info.mask,
					});
				},
				getRoute: path => {
					const route = get().routes[path];

					invariant(route, `No route matching path ${path}`);

					return route;
				},
			},
		};
	},
);

function* routeMaskGenerator() {
	for (let i = 0; i < Infinity; i++) {
		yield Math.pow(2, i);
	}
}
