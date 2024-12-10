import { noop } from "es-toolkit";
import type { AuthnContext } from "./authn";
import type { AuthzContext } from "./authz";
import type { FliptContext } from "./flipt";
import type { RouteContext } from "./router";
import type { UserContext } from "./user";

export const createAuthnContext = (): AuthnContext => ({
	isAuthenticated: false,
	userProfile: null,
	realmAccess: null,
	resourceAccess: null,
});

export const createAuthzContext = (): AuthzContext => Object.create(null);

export const createFliptContext = (): FliptContext => Object.create(null);

export const createRouteContext = (): RouteContext => ({
	routes: Object.create(null),
	appendRoute: noop,
	getRoute: noop as any,
});

export const createUserContext = (): UserContext => Object.create(null);
