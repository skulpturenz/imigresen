import {
	Navigate,
	Route as SolidRoute,
	type RouteSectionProps,
	type RouteProps as SolidRouteProps,
} from "@solidjs/router";
import { CoreRoute } from "core/constants/core-route.enum";
import { AuthnContext } from "core/context/authn";
import { AuthzContext } from "core/context/authz";
import { FliptContext } from "core/context/flipt";
import { RouteContext } from "core/context/router";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { spreadProps } from "core/utils";
import {
	createEffect,
	createResource,
	Show,
	type Component,
	type ParentProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";

export interface CoreContext {
	user: UserContext;
	authz: AuthzContext;
	authn: AuthnContext;
	flipt: FliptContext;
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

export interface RouteInternalProps {
	onLoaded?: (route: RouteProps & { info: RouteInternalProps }) => void;
}

export interface RouteMeta {
	isAllowed: boolean;
	isHidden: boolean;
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
		if (typeof props.isAllowed === "undefined") {
			return true;
		}

		if (typeof props.isAllowed === "boolean") {
			return props.isAllowed;
		}

		return props.isAllowed?.(context);
	};
	const getIsHidden = async () => {
		if (typeof props.isHidden === "undefined") {
			return false;
		}

		if (typeof props.isHidden === "boolean") {
			return props.isHidden;
		}

		return props.isHidden?.(context);
	};
	const [isAllowed] = createResource(getIsAllowed);
	const [isHidden] = createResource(getIsHidden);

	const UnauthorizedRedirect = () => (
		<Navigate href={toPath(CoreRoute.Unauthorized)} />
	);

	// TODO: improve
	const Loading = () => <span>Loading!!!</span>;

	const Component: Component<
		RouteSectionProps<unknown>
	> = routeSectionProps => {
		return (
			<>
				<Show
					when={!isAllowed.loading && !isHidden.loading}
					fallback={<Loading />}>
					<Show when={isAllowed()}>
						<Dynamic
							{...spreadProps(routeSectionProps)}
							component={props.component}
						/>
					</Show>
					<Show when={!isAllowed()}>
						<UnauthorizedRedirect />
					</Show>
				</Show>
			</>
		);
	};

	createEffect(() => {
		if (isAllowed.loading || isHidden.loading) {
			return;
		}

		const { onLoaded, ...routeDefinition } = props as RouteProps &
			RouteInternalProps;

		onLoaded?.({
			...routeDefinition,
			info: {
				isAllowed: Boolean(isAllowed()),
				isHidden: Boolean(isHidden()),
			},
		});
	});

	return (
		<SolidRoute
			{...spreadProps(props)}
			component={Component}
			info={{
				isAllowed: Boolean(isAllowed()),
				isHidden: Boolean(isHidden()),
			}}
		/>
	);
};

export const toPath = (...paths: string[]) => `/${paths.join("/")}`;

export const addRoutes = (...routes: RouteProps[]) => {
	const routeContext = useContext(RouteContext);

	const InternalRoute = Route as Component<
		ParentProps<RouteProps & RouteInternalProps>
	>;

	const RouteChildren: Component<RouteSectionProps> = props => props.children;

	return Object.values(routes).map(route => {
		const children = Array.isArray(route.children)
			? route.children
			: ([route.children].filter(Boolean) as RouteProps[]);

		return (
			<InternalRoute
				{...route}
				component={route.component ?? RouteChildren}
				path={route.path}
				children={addRoutes(...children)}
				onLoaded={routeContext.appendRoute}
			/>
		);
	});
};
