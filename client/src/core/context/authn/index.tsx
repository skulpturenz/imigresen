import { createAuthnContext } from "core/context/initializers";
import {
	default as Keycloak,
	type KeycloakProfile,
	type KeycloakResourceAccess,
	type KeycloakRoles,
} from "keycloak-js";
import {
	createContext,
	createSignal,
	onMount,
	type Component,
	type ParentProps,
} from "solid-js";
import { createStore } from "solid-js/store";

export interface AuthnContext {
	isAuthenticated: boolean;
	userProfile?: KeycloakProfile | null;
	realmAccess?: KeycloakRoles | null;
	resourceAccess?: KeycloakResourceAccess | null;
}

export const AuthnContext = createContext<AuthnContext>(createAuthnContext());

export interface AuthnProviderProps {
	url: string;
	realm: string;
	clientId: string;
	loginRedirectUri: string;
	logoutRedirectUri: string;
}

export const AuthnProvider: Component<
	ParentProps<AuthnProviderProps>
> = props => {
	const [isLoading, setIsLoading] = createSignal(true);
	const toggleLoading = () => setIsLoading(isLoading => !isLoading);

	const [contextValue, setContextValue] =
		createStore<AuthnContext>(createAuthnContext());

	const keycloak = new Keycloak({
		url: props.url,
		realm: props.realm,
		clientId: props.clientId,
	});

	const createRedirectUrl = (
		authRedirectUri: string,
		redirectPath?: string,
	) => {
		const params = new URLSearchParams({
			redirectPath: redirectPath ?? "",
		});

		params.forEach((value, key) => {
			if (!value) {
				params.delete(key);
			}
		});

		const url = URL.parse(
			[authRedirectUri, params.toString()].filter(Boolean).join("?"),
		);

		return url ?? new URL("/", location.origin);
	};

	onMount(() => {
		const initKeycloak = async () => {
			await keycloak.init({
				onLoad: "check-sso",
				silentCheckSsoRedirectUri: `${location.origin}/silent-check-sso.html`,
				scope: "openid roles profile email address",
				redirectUri: createRedirectUrl(
					props.loginRedirectUri,
					location.pathname,
				).href,
			});

			if (!keycloak.authenticated) {
				return;
			}

			const userProfile = await keycloak.loadUserProfile();

			setContextValue(contextValue => ({
				...contextValue,
				isAuthenticated: Boolean(keycloak.authenticated),
				userProfile,
				realmAccess: keycloak.realmAccess ?? null,
				resourceAccess: keycloak.resourceAccess ?? null,
			}));
		};

		initKeycloak().then(toggleLoading);
	});

	const onClickLogin = () => {
		keycloak.login({
			redirectUri: createRedirectUrl(
				props.loginRedirectUri,
				location.pathname,
			).href,
		});
	};

	const onClickRegister = () => {
		keycloak.register({
			redirectUri: createRedirectUrl(
				props.loginRedirectUri,
				location.pathname,
			).href,
		});
	};

	const onClickLogout = () => {
		keycloak.logout({
			redirectUri: createRedirectUrl(props.logoutRedirectUri).href,
		});
	};

	// TODO: remove buttons
	return (
		<AuthnContext.Provider value={contextValue}>
			{!isLoading() && (
				<>
					<button on:click={onClickLogin}>Click here login!</button>
					<button on:click={onClickRegister}>
						Click here register!
					</button>
					<button on:click={onClickLogout}>
						Click here to logout!!
					</button>
					<span>
						isAuthenticated:&nbsp;
						{JSON.stringify(Boolean(contextValue.isAuthenticated))}
					</span>
					{props.children}
				</>
			)}
		</AuthnContext.Provider>
	);
};
