import { noop } from "es-toolkit";
import type { AuthnSvc } from "./authn/store";
import type { AuthzContext } from "./authz";
import type { FliptContext } from "./flipt";
import type { RouteContext } from "./router";
import type { UserContext } from "./user";

export const createAuthnContext = (): AuthnSvc => ({
	isInitialLoading: true,
	keycloak: null,
	profile: null,
	actions: {
		init: noop,
		login: noop,
		register: noop,
		logout: noop,
	},
});

export const createAuthzContext = (): AuthzContext => Object.create(null);

export const createFliptContext = (): FliptContext => Object.create(null);

export const createRouteContext = (): RouteContext => ({
	routes: Object.create(null),
	appendRoute: noop,
	getRoute: noop as any,
});

export const createUserContext = (): UserContext => Object.create(null);
