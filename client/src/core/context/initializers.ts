import { noop } from "es-toolkit";
import type { AuthnContext } from "./authn";
import type { AuthzContext } from "./authz";
import type { FliptContext } from "./flipt";
import type { RouteContext } from "./router";
import type { UserContext } from "./user";

export const createAuthnContext = (): AuthnContext => ({
	isAuthenticated: false,
	accessToken: null,
	userProfile: null,
	realmAccess: null,
	resourceAccess: null,
	isTokenExpired: noop as any,
	updateToken: noop as any,
	onClickLogin: noop,
	onClickRegister: noop,
	onClickLogout: noop,
});

export const createAuthzContext = (): AuthzContext => Object.create(null);

export const createFliptContext = (): FliptContext => Object.create(null);

export const createRouteContext = (): RouteContext => ({
	routes: Object.create(null),
	appendRoute: noop,
	getRoute: noop as any,
});

export const createUserContext = (): UserContext => Object.create(null);
