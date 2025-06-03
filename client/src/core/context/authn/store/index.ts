import { default as mbxClient } from "@mapbox/mapbox-sdk";
import { default as tokensClient } from "@mapbox/mapbox-sdk/services/tokens";
import { AuthRoute } from "core/constants/auth-route.enum";
import { CoreRoute } from "core/constants/core-route.enum";
import { storageKeys } from "core/constants/storage-keys";
import { toPath } from "core/router/route";
import { addSeconds, secondsToMilliseconds } from "date-fns";
import { invariant, once, trimEnd } from "es-toolkit";
import { default as Cookies } from "js-cookie";
import { default as Keycloak, type KeycloakProfile } from "keycloak-js";
import { createWithSignal } from "solid-zustand";
import { createRedirectUrl } from "./utils";

invariant(import.meta.env.VITE_AUTOMERGE_WSS, "Automerge API not specified");
invariant(
	import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
	"Mapbox token not specified",
);

export const AUTHN_SVC_SUB_CONFIG_KEY = `imigresen-${import.meta.env.MODE}-sub`;

export interface AuthnSvc {
	isInitialLoading: boolean;
	isActionsLoading: boolean;
	keycloak?: Keycloak | null;
	profile?: KeycloakProfile | null;
	userId: string;
	mapboxToken?: string;
	actions: {
		init: () => void;
		login: () => void;
		register: () => void;
		logout: () => void;
		cleanup: () => void;
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
		trimEnd(authnProviderClientUrl.href, "/"),
		toPath(CoreRoute.Auth, AuthRoute.LoginCallback),
	].join("");
	const logoutRedirectUri = [
		trimEnd(authnProviderClientUrl.href, "/"),
		toPath(CoreRoute.Auth, AuthRoute.LogoutCallback),
	].join("");

	const setAuthCookie = () => {
		if (!get().keycloak?.token) {
			return;
		}

		const cookie = Cookies.set(
			storageKeys.authCookie,
			get().keycloak?.token ?? "",
			{
				domain: `.${window.location.hostname}`,
				expires: new Date(
					secondsToMilliseconds(
						get().keycloak?.tokenParsed?.exp ?? 0,
					),
				),
				secure: import.meta.env.PROD,
				sameSite: "Strict",
			},
		);

		if (!cookie) {
			return;
		}

		document.cookie = cookie;
	};

	const deleteAuthCookie = () => {
		// https://github.com/js-cookie/js-cookie?tab=readme-ov-file#basic-usage
		// need to use same attributes for `path`, `domain`, `secure` and `sameSite`
		Cookies.remove(storageKeys.authCookie, {
			domain: `.${window.location.hostname}`,
			secure: import.meta.env.PROD,
			sameSite: "Strict",
		});
	};

	const mapboxClient = mbxClient({
		accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
	});
	const mapboxTokensClient = tokensClient(mapboxClient);

	const REFRESH_INTERVAL_SECONDS = 5;
	const getTempMapboxToken = async () => {
		const { body } = await mapboxTokensClient
			.createTemporaryToken({
				scopes: ["datasets:read"],
				expires: addSeconds(
					new Date(),
					REFRESH_INTERVAL_SECONDS * 1.5,
				).toISOString(),
			})
			.send();

		set({ mapboxToken: body.token });
	};

	const refreshMapBoxTokenInterval = setInterval(
		getTempMapboxToken,
		secondsToMilliseconds(REFRESH_INTERVAL_SECONDS),
	);

	return {
		isInitialLoading: true,
		isActionsLoading: false,
		profile: null,
		keycloak: new Keycloak({
			url: authnProviderUrl,
			realm: authnProviderRealm,
			clientId: authnProviderClientId,
		}),
		userId: crypto.randomUUID(),
		actions: {
			init: once(async () => {
				invariant(get().keycloak, "Keycloak instance not defined");

				set({ isInitialLoading: true });

				await getTempMapboxToken();

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

				const keycloak = get().keycloak;
				invariant(keycloak, "Keycloak is initialized incorrectly");

				const profile = await get().keycloak?.loadUserProfile();

				if (!import.meta.env.SSR) {
					setAuthCookie();
					keycloak.onAuthRefreshSuccess = setAuthCookie;

					window.localStorage.setItem(
						AUTHN_SVC_SUB_CONFIG_KEY,
						keycloak.tokenParsed?.sub ?? "",
					);
				}

				set({ profile, userId: keycloak.tokenParsed?.sub });
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

				deleteAuthCookie();
				set({ isActionsLoading: true });

				get().keycloak?.logout({
					redirectUri: createRedirectUrl(logoutRedirectUri).href,
				});
			},
			cleanup: once(() => {
				clearInterval(refreshMapBoxTokenInterval);
			}),
		},
	};
});
