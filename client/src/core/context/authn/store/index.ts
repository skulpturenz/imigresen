import { default as mbxClient } from "@mapbox/mapbox-sdk";
import { default as tokensClient } from "@mapbox/mapbox-sdk/services/tokens";
import { AuthRoute } from "core/constants/auth-route.enum";
import { CoreRoute } from "core/constants/core-route.enum";
import { storageKeys } from "core/constants/storage-keys";
import { toPath } from "core/router/utils";
import { assertEnv } from "core/utils/assert-env";
import { addSeconds, secondsToMilliseconds } from "date-fns";
import { invariant, once, trimEnd } from "es-toolkit";
import { default as Cookies } from "js-cookie";
import { default as Keycloak, type KeycloakProfile } from "keycloak-js";
import { createWithSignal } from "solid-zustand";
import { createRedirectUrl } from "./utils";

assertEnv(import.meta.env.VITE_AUTOMERGE_WSS, "Automerge API not specified");
assertEnv(
	import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
	"Mapbox token not specified",
);

export const AUTHN_SVC_SUB_CONFIG_KEY = `imigresen-${import.meta.env.MODE}-sub`;

export interface AuthnSvc {
	isInitialLoading: boolean;
	isActionsLoading: boolean;
	keycloak?: Keycloak | null;
	profile?: KeycloakProfile | null;
	userId: string; // either an anonymous (browser) persisted id or keycloak id
	mapboxToken?: string;
	actions: {
		init: () => void;
		login: () => void;
		register: () => void;
		logout: () => void;
		cleanup: () => void;
	};
}

export interface AuthSvcInternal {
	refreshMapboxTokenInterval?: ReturnType<typeof setInterval>;
}

export const useStore = createWithSignal<AuthnSvc & AuthSvcInternal>(
	(set, get) => {
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

		assertEnv(authnProviderUrl, "Keycloak URL not specified");
		assertEnv(authnProviderRealm, "Keycloak realm not specified");
		assertEnv(authnProviderClientId, "Keycloak client ID not specified");
		assertEnv(authnProviderClientUrl, "Keycloak client URL not specified");

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

		const initMapbox = () => {
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

			const refreshMapboxTokenInterval = setInterval(
				getTempMapboxToken,
				secondsToMilliseconds(REFRESH_INTERVAL_SECONDS),
			);

			getTempMapboxToken();

			return refreshMapboxTokenInterval;
		};

		const getUserId = () => {
			const existingUserId = window.localStorage.getItem(
				AUTHN_SVC_SUB_CONFIG_KEY,
			);
			if (existingUserId) {
				return existingUserId;
			}

			const userId = crypto.randomUUID();
			window.localStorage.setItem(AUTHN_SVC_SUB_CONFIG_KEY, userId);

			return userId;
		};

		return {
			isInitialLoading: true,
			isActionsLoading: false,
			profile: null,
			keycloak: null,
			userId: getUserId(),
			actions: {
				init: once(async () => {
					const keycloak = new Keycloak({
						url: authnProviderUrl ?? "-",
						realm: authnProviderRealm ?? "-",
						clientId: authnProviderClientId ?? "-",
					});

					set({ keycloak, isInitialLoading: true });

					await keycloak.init({
						onLoad: "check-sso",
						silentCheckSsoRedirectUri: `${location.origin}/silent-check-sso.html`,
						scope: "openid roles profile email",
						redirectUri: createRedirectUrl(
							loginRedirectUri,
							location.pathname,
						).href,
						pkceMethod: "S256",
					});

					set({ refreshMapboxTokenInterval: initMapbox() });

					if (!keycloak.authenticated) {
						set({ isInitialLoading: false });

						return;
					}

					const profile = await keycloak.loadUserProfile();

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
					window.localStorage.removeItem(AUTHN_SVC_SUB_CONFIG_KEY);
					set({ isActionsLoading: true });

					get().keycloak?.logout({
						redirectUri: createRedirectUrl(logoutRedirectUri).href,
					});
				},
				cleanup: once(() => {
					clearInterval(get().refreshMapboxTokenInterval);
				}),
			},
		};
	},
);
