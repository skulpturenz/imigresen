import { noop } from "es-toolkit";
import type { AuthnSvc } from "./authn/store";
import type { AuthzContext } from "./authz";
import type { FliptSvc } from "./flipt";
import type { RouterSvc } from "./router";
import type { UiSvc } from "./ui";
import type { UserSvc } from "./user/store";

export const createAuthnContext = (): AuthnSvc => ({
	isInitialLoading: true,
	isInitialError: false,
	isActionsLoading: false,
	keycloak: null,
	profile: null,
	userId: "",
	actions: {
		init: noop,
		login: noop,
		register: noop,
		logout: noop,
		cleanup: noop,
	},
});

export const createUiContext = (): UiSvc => ({
	isInitialLoading: () => true,
	locale: "en-NZ",
	theme: "dark",
	mode: "default",
	actions: {
		init: noop,
		setTheme: noop,
		setMode: noop,
		setLocale: noop,
	},
});

export const createAuthzContext = (): AuthzContext => Object.create(null);

export const createFliptContext = (): FliptSvc => ({
	isInitialLoading: true,
	isInitialError: false,
	flags: [],
	flipt: null,
	actions: {
		init: noop as any,
		close: noop,
	},
});

export const createRouterContext = (): RouterSvc => ({
	isInitialLoading: () => true,
	routes: Object.create(null),
	actions: {
		reset: noop as any,
		getNextMask: noop as any,
		appendRoute: noop,
		getRoute: noop as any,
	},
});

export const createUserContext = (): UserSvc => ({
	isInitialLoading: true,
	profile: null,
	actions: {
		init: noop as any,
		completeSync: noop,
	},
});
