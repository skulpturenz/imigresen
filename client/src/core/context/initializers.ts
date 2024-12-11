import { noop } from "es-toolkit";
import type { AuthnSvc } from "./authn/store";
import type { AuthzContext } from "./authz";
import type { FliptSvc } from "./flipt";
import type { RouterSvc } from "./router";
import type { UserContext } from "./user";

export const createAuthnContext = (): AuthnSvc => ({
	isInitialLoading: true,
	isActionsLoading: false,
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

export const createFliptContext = (): FliptSvc => ({
	isInitialLoading: true,
	flags: [],
	flipt: null,
	actions: {
		init: noop,
		close: noop,
	},
});

export const createRouterContext = (): RouterSvc => ({
	routes: Object.create(null),
	actions: {
		appendRoute: noop,
		getRoute: noop as any,
	},
});

export const createUserContext = (): UserContext => Object.create(null);
