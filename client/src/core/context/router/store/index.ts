import type { RouteInternalProps, RouteProps } from "core/router/route";
import { invariant } from "es-toolkit";
import { createWithSignal } from "solid-zustand";

export interface RouterSvc {
	routes: Record<string, Omit<RouteProps & RouteInternalProps, "path">>;
	actions: {
		appendRoute: (route: RouteProps) => void;
		getRoute: (path: string) => RouteProps;
	};
}
export const useStore = createWithSignal<RouterSvc>((set, get) => ({
	routes: Object.create(null),
	actions: {
		appendRoute: route => {
			set({ routes: { ...get().routes, [route.path]: route } });
		},
		getRoute: path => {
			const route = get().routes[path];

			invariant(route, `No route matching path ${path}`);

			return route;
		},
	},
}));
