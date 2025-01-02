import { Title } from "@solidjs/meta";
import {
	Navigate,
	Route as SolidRoute,
	type RouteSectionProps,
	type RouteProps as SolidRouteProps,
} from "@solidjs/router";
import { CoreRoute } from "core/constants/core-route.enum";
import { AuthnContext, type AuthnSvc } from "core/context/authn";
import { AuthzContext } from "core/context/authz";
import { FliptContext, type FliptSvc } from "core/context/flipt";
import { RouterContext } from "core/context/router";
import { UserContext, type UserSvc } from "core/context/user";
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
import { PageLoading } from "ui/page-loading";

export interface CoreContext {
	user: UserSvc;
	authz: AuthzContext;
	authn: AuthnSvc;
	flipt: FliptSvc;
}

export interface RouteProps<S extends string = any, T = unknown>
	extends Omit<SolidRouteProps<S, T>, "children" | "info"> {
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
	meta?: {
		navigationConfig?: {
			sort?: number;
			title?: string;
			description?: string;
		};
	};
}

export interface RouteInternalProps {
	info?: Partial<RouteInternalMeta>;
	onLoaded?: (route: RouteProps & RouteInternalProps) => void;
}

export interface RouteInternalMeta {
	mask: number;
	hrefPath: string;
	isAllowed: boolean;
	isHidden: boolean;
}

export const Route: Component<
	ParentProps<Omit<RouteProps, "children"> & RouteInternalProps>
> = props => {
	const authnContext = useContext(AuthnContext);
	const authzContext = useContext(AuthzContext);
	const fliptContext = useContext(FliptContext);
	const userContext = useContext(UserContext);

	const context = () => ({
		authn: authnContext(),
		authz: authzContext(),
		flipt: fliptContext(),
		user: userContext(),
	});

	const getIsAllowed = async () => {
		if (typeof props.isAllowed === "undefined") {
			return true;
		}

		if (typeof props.isAllowed === "boolean") {
			return props.isAllowed;
		}

		return props.isAllowed?.(context());
	};
	const getIsHidden = async () => {
		if (typeof props.isHidden === "undefined") {
			return false;
		}

		if (typeof props.isHidden === "boolean") {
			return props.isHidden;
		}

		return props.isHidden?.(context());
	};
	const [isAllowed] = createResource(getIsAllowed);
	const [isHidden] = createResource(getIsHidden);

	const UnauthorizedRedirect = () => (
		<Navigate href={toPath(CoreRoute.Unauthorized)} />
	);

	const Component: Component<
		RouteSectionProps<unknown>
	> = routeSectionProps => {
		const getMetaTitle = (title?: string) => {
			if (title) {
				return `${title} | Imigresen`;
			}

			return "Imigresen";
		};

		return (
			<>
				<Title>{getMetaTitle(props.title)}</Title>

				<PageLoading
					isLoading={
						(isAllowed.loading || isHidden.loading) &&
						(typeof props.isAllowed !== "undefined" ||
							typeof props.isHidden !== "undefined")
					}
				/>
				<Show when={!isAllowed.loading && !isHidden.loading}>
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

		const {
			onLoaded,
			meta,
			info,
			// These children are not useful to us, we need to be able to retrieve props
			// and these children are resolved jsx elements
			children: _children,
			...routeDefinition
		} = props as RouteProps & RouteInternalProps;

		onLoaded?.({
			...routeDefinition,
			info: {
				...meta,
				...info,
				isAllowed: Boolean(isAllowed()),
				isHidden: Boolean(isHidden()),
			},
		});
	});

	return (
		<>
			<SolidRoute
				{...spreadProps(props)}
				component={Component}
				info={{
					...props.meta,
					...props.info,
					isAllowed: Boolean(isAllowed()),
					isHidden: Boolean(isHidden()),
				}}
			/>
		</>
	);
};

export const toPath = (...paths: string[]) => `/${paths.join("/")}`;

export const addRoutes = (...routes: RouteProps[]) => {
	const addRoutesWithParentPath = (
		parentPath: string | null,
		...routes: RouteProps[]
	) => {
		const getRouteContext = useContext(RouterContext);

		const InternalRoute = Route as Component<
			ParentProps<RouteProps & RouteInternalProps>
		>;

		const getHrefPath = (path: string | string[]) => {
			const pathKey = Array.isArray(path) ? path.at(0) : path;

			return [parentPath || null, pathKey]
				.filter(Boolean)
				.join("/")
				.replace(/(\/)\/+/g, "$1");
		};

		return Object.values(routes).map(route => {
			// note: we don't want this to be within a reactive scope
			// otherwise we just get infinite loading
			const children = addRoutesWithParentPath(
				getHrefPath(route.path),
				...(Array.isArray(route.children)
					? route.children
					: ([route.children].filter(Boolean) as RouteProps[])),
			);

			// note: we don't want this to be within a reactive scope
			// otherwise we just get infinite loading
			const routeContext = getRouteContext();

			return (
				<InternalRoute
					{...route}
					component={route.component ?? Children}
					children={children}
					path={route.path}
					info={{
						mask: routeContext.actions.getNextMask(),
						hrefPath: getHrefPath(route.path),
					}}
					onLoaded={routeContext.actions.appendRoute}
				/>
			);
		});
	};

	return addRoutesWithParentPath(null, ...routes);
};

export const Children: Component<RouteSectionProps> = props => props.children;
