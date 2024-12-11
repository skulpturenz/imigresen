import { AuthRoute } from "core/constants/auth-route.enum";
import { CoreRoute } from "core/constants/core-route.enum";
import { toPath } from "core/router/route";
import { invariant } from "es-toolkit";
import { default as Keycloak, type KeycloakProfile } from "keycloak-js";
import { createWithSignal } from "solid-zustand";
import { createRedirectUrl } from "./utils";

export interface AuthnSvc {
	isInitialLoading: boolean;
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
		profile: null,
		keycloak: new Keycloak({
			url: authnProviderUrl,
			realm: authnProviderRealm,
			clientId: authnProviderClientId,
		}),
		actions: {
			init: async () => {
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

				set({ profile });
				set({ isInitialLoading: false });
			},
			login: () => {
				invariant(get().keycloak, "Keycloak instance not defined");

				get().keycloak?.login({
					redirectUri: createRedirectUrl(
						loginRedirectUri,
						location.pathname,
					).href,
				});
			},
			register: () => {
				invariant(get().keycloak, "Keycloak instance not defined");

				get().keycloak?.register({
					redirectUri: createRedirectUrl(
						loginRedirectUri,
						location.pathname,
					).href,
				});
			},
			logout: () => {
				invariant(get().keycloak, "Keycloak instance not defined");

				get().keycloak?.logout({
					redirectUri: createRedirectUrl(logoutRedirectUri).href,
				});
			},
		},
	};
});
