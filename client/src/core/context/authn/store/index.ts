import { AuthRoute } from "core/constants/auth-route.enum";
import { CoreRoute } from "core/constants/core-route.enum";
import { toPath } from "core/router/route";
import { invariant, once } from "es-toolkit";
import { default as Keycloak, type KeycloakProfile } from "keycloak-js";
import { createWithSignal } from "solid-zustand";
import { createRedirectUrl } from "./utils";

export const AUTHN_SVC_SUB_CONFIG_KEY = `imigresen-${import.meta.env.MODE}-sub`;

export interface AuthnSvc {
	isInitialLoading: boolean;
	isActionsLoading: boolean;
	keycloak?: Keycloak | null;
	profile?: KeycloakProfile | null;
	actions: {
		init: () => void;
		login: () => void;
		register: () => void;
		logout: () => void;
	};
}

export const useStore = createWithSignal<AuthnSvc>((set, get) => {
	const authnProviderUrl = import.meta.env.VITE_KEYCLOAK_URL;
	const authnProviderRealm = import.meta.env.VITE_KEYCLOAK_REALM;
	const authnProviderClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
	const authnProviderClientUrl = import.meta.env.VITE_KEYCLOAK_CLIENT_URL;

	invariant(authnProviderUrl, "Keycloak URL not specified");
	invariant(authnProviderRealm, "Keycloak realm not specified");
	invariant(authnProviderClientId, "Keycloak client ID not specified");
	invariant(authnProviderClientUrl, "Keycloak client URL not specified");

	const loginRedirectUri = [
		authnProviderClientUrl,
		toPath(CoreRoute.Auth, AuthRoute.LoginCallback),
	].join("");
	const logoutRedirectUri = [
		authnProviderClientUrl,
		toPath(CoreRoute.Auth, AuthRoute.LogoutCallback),
	].join("");

	return {
		isInitialLoading: true,
		isActionsLoading: false,
		profile: null,
		keycloak: new Keycloak({
			url: authnProviderUrl,
			realm: authnProviderRealm,
			clientId: authnProviderClientId,
		}),
		actions: {
			init: once(async () => {
				invariant(get().keycloak, "Keycloak instance not defined");

				set({ isInitialLoading: true });

				await get().keycloak?.init({
					onLoad: "check-sso",
					silentCheckSsoRedirectUri: `${location.origin}/silent-check-sso.html`,
					scope: "openid roles profile email address",
					redirectUri: createRedirectUrl(
						loginRedirectUri,
						location.pathname,
					).href,
				});

				if (!get().keycloak?.authenticated) {
					set({ isInitialLoading: false });

					return;
				}

				const profile = await get().keycloak?.loadUserProfile();

				if (!import.meta.env.SSR) {
					window.localStorage.setItem(
						AUTHN_SVC_SUB_CONFIG_KEY,
						get().keycloak?.tokenParsed?.sub ?? "",
					);
				}

				set({ profile });
				set({ isInitialLoading: false });
			}),
			login: () => {
				invariant(get().keycloak, "Keycloak instance not defined");

				set({ isActionsLoading: true });

				get().keycloak?.login({
					redirectUri: createRedirectUrl(
						loginRedirectUri,
						location.pathname,
					).href,
				});

				set({ isActionsLoading: false });
			},
			register: () => {
				invariant(get().keycloak, "Keycloak instance not defined");

				set({ isActionsLoading: true });

				get().keycloak?.register({
					redirectUri: createRedirectUrl(
						loginRedirectUri,
						location.pathname,
					).href,
				});

				set({ isActionsLoading: false });
			},
			logout: () => {
				invariant(get().keycloak, "Keycloak instance not defined");

				set({ isActionsLoading: true });

				get().keycloak?.logout({
					redirectUri: createRedirectUrl(logoutRedirectUri).href,
				});

				set({ isActionsLoading: false });
			},
		},
	};
});
