import type { RouteInternalProps, RouteProps } from "core/router/route";
import { invariant, noop } from "es-toolkit";
import { createContext, type Component, type ParentProps } from "solid-js";
import { createStore } from "solid-js/store";

export interface RouteContext {
	routes: Record<string, Omit<RouteProps, "path">>;
	appendRoute: (route: RouteProps) => void;
	getRoute: (path: string) => RouteProps;
}

export const RouteContext = createContext<RouteContext>({
	routes: Object.create(null),
	appendRoute: noop,
	getRoute: noop as any,
});

export const RouteProvider: Component<ParentProps> = props => {
	const [routes, setRoutes] = createStore<
		Record<string, RouteProps & { info: RouteInternalProps }>
	>(Object.create(null));

	const appendRoute = (route: RouteProps) =>
		setRoutes(routes => ({
			...routes,
			[route.path]: route,
		}));

	const getRoute = (path: string) => {
		const route = routes[path];

		invariant(route, `No route matching path ${path}`);

		return route;
	};

	const value = {
		routes,
		appendRoute,
		getRoute,
	};

	return (
		<RouteContext.Provider value={value}>
			{props.children}
		</RouteContext.Provider>
	);
};
