import { AuthRoute } from "core/constants/auth-route.enum";
import { CoreRoute } from "core/constants/core-route.enum";
import { toPath } from "core/router/route";
import { invariant, noop, once } from "es-toolkit";
import { default as Keycloak, type KeycloakProfile } from "keycloak-js";
import { createWithSignal } from "solid-zustand";
import { createRedirectUrl } from "./utils";

invariant(import.meta.env.VITE_AUTOMERGE_WSS, "Automerge API not specified");

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

	const stripPath = (url: URL | string) => {
		const withoutPath = new URL((url as URL).href || url);

		withoutPath.pathname = "";
		withoutPath.search = "";
		withoutPath.hash = "";

		return withoutPath;
	};
	const authnProviderClientUrl = stripPath(window.location.href);

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

				// TODO: maybe better to move to BE
				// don't await so that if a request gets blocked by CORS then
				// it doesn't stop loading profiles from happening
				fetch(getAutomergeUrl("/api/v1")).catch(noop);
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

				// TODO: maybe better to move to BE
				// at the moment after FE logs in when we attempt to make
				// the WebSocket connection we will get authenticated
				// but we also need to logout
				// don't await so that if a request gets blocked by CORS then
				// it doesn't stop keycloak logout from happening
				fetch(getAutomergeUrl("/logout")).catch(noop);

				get().keycloak?.logout({
					redirectUri: createRedirectUrl(logoutRedirectUri).href,
				});
			},
		},
	};
});

const getAutomergeUrl = (path: string) => {
	const getProtocol = (currentProtocol: string) => {
		if (currentProtocol.toLowerCase() === "wss") {
			return "https";
		}

		if (currentProtocol.toLowerCase() === "ws") {
			return "http";
		}

		return currentProtocol.toLowerCase();
	};

	const logoutUrl = new URL(import.meta.env.VITE_AUTOMERGE_WSS);

	const logoutProtocol = getProtocol(logoutUrl.protocol);

	logoutUrl.protocol = logoutProtocol;
	logoutUrl.pathname = path;

	return logoutUrl;
};
