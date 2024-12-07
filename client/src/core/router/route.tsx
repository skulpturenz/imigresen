import {
	Navigate,
	Route as SolidRoute,
	type RouteProps as SolidRouteProps,
} from "@solidjs/router";
import { CoreRoute } from "core/constants/core-route.enum";
import { AuthnContext } from "core/context/authn";
import { AuthzContext } from "core/context/authz";
import { FliptContext } from "core/context/flipt";
import { RouteContext } from "core/context/router";
import { UserContext } from "core/context/user";
import {
	createResource,
	useContext,
	type Component,
	type ParentProps,
} from "solid-js";

export interface CoreContext {
	user?: UserContext;
	authz?: AuthzContext;
	authn?: AuthnContext;
	flipt?: FliptContext;
}

export interface RouteProps<S extends string = any, T = unknown>
	extends Omit<SolidRouteProps<S, T>, "children"> {
	title?: string;
	isAllowed?:
		| boolean
		| ((coreContext: CoreContext) => Promise<boolean>)
		| ((coreContext: CoreContext) => boolean);
	isHidden?:
		| boolean
		| ((coreContext: CoreContext) => Promise<boolean>)
		| ((coreContext: CoreContext) => boolean);
	children?: RouteProps | RouteProps[];
}

export const Route: Component<ParentProps<RouteProps>> = props => {
	const authnContext = useContext(AuthnContext);
	const authzContext = useContext(AuthzContext);
	const fliptContext = useContext(FliptContext);
	const userContext = useContext(UserContext);

	const context = {
		authn: authnContext,
		authz: authzContext,
		flipt: fliptContext,
		user: userContext,
	};

	const getIsAllowed = async () => {
		if (typeof props.isAllowed === "boolean") {
			return props.isAllowed;
		}

		return props.isAllowed?.(context);
	};
	const [isAllowed] = createResource(getIsAllowed);

	if (isAllowed.loading) {
		return "Loading...";
	}

	if (!isAllowed.loading && !isAllowed()) {
		return <Navigate href={toPath(CoreRoute.Unauthorized)} />;
	}

	return <SolidRoute {...props} />;
};

export const toPath = (...paths: string[]) => `/${paths.join("/")}`;

export const addRoutes = (...routes: RouteProps[]) => {
	const routeContext = useContext(RouteContext);

	return Object.values(routes).map(route => {
		routeContext.appendRoute(route);

		const children = Array.isArray(route.children)
			? route.children
			: ([route.children].filter(Boolean) as RouteProps[]);

		return (
			<Route
				path={route.path}
				{...route}
				children={addRoutes(...(children ?? []))}
			/>
		);
	});
};
