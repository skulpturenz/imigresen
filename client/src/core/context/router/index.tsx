import type { RouteProps } from "core/router/route";
import { noop } from "es-toolkit";
import { createContext, type Component, type ParentProps } from "solid-js";
import { createStore } from "solid-js/store";

export interface RouteContext {
	routes: Record<string, Omit<RouteProps, "path">[]>;
	appendRoute: (route: RouteProps) => void;
}

export const RouteContext = createContext<RouteContext>({
	routes: Object.create(null),
	appendRoute: noop,
});

export const RouteProvider: Component<ParentProps> = props => {
	const [routes, setRoutes] = createStore<Record<string, RouteProps[]>>(
		Object.create(null),
	);

	const appendRoute = (route: RouteProps) =>
		setRoutes(routes => ({
			...routes,
			[route.path]: route,
		}));

	const getRoute = (path: string) => routes[path];

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