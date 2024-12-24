import { noop } from "es-toolkit";
import type { AuthnSvc } from "./authn/store";
import type { AuthzContext } from "./authz";
import type { FliptSvc } from "./flipt";
import type { RouterSvc } from "./router";
import type { UiSvc } from "./ui";
import type { UserSvc } from "./user/store";

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

export const createUiContext = (): UiSvc => ({
	isInitialLoading: () => true,
	locale: "en-US",
	theme: "dark",
	mode: "default",
	queryClient: null,
	actions: {
		init: noop,
		setTheme: noop,
		setMode: noop,
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

export const createUserContext = (): UserSvc => ({
	isInitialLoading: true,
	profile: null,
	actions: {
		init: noop,
	},
});
