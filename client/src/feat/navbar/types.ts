import type { RouteInternalProps, RouteProps } from "core/router/route";

export interface NavbarItem {
	trigger: RouteProps & RouteInternalProps;
	children: (RouteProps & RouteInternalProps)[];
}
