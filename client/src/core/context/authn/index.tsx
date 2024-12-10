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
	Show,
	type Component,
	type ParentProps,
} from "solid-js";
import { createStore } from "solid-js/store";

export interface AuthnContext {
	isAuthenticated: boolean;
	accessToken?: string | null;
	userProfile?: KeycloakProfile | null;
	realmAccess?: KeycloakRoles | null;
	resourceAccess?: KeycloakResourceAccess | null;
	isTokenExpired: (minValidity?: number) => boolean;
	updateToken: (minValidity?: number) => Promise<boolean>;
	onClickLogin: () => void;
	onClickRegister: () => void;
	onClickLogout: () => void;
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

	const keycloak = new Keycloak({
		url: props.url,
		realm: props.realm,
		clientId: props.clientId,
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

	const [contextValue, setContextValue] = createStore<AuthnContext>({
		...createAuthnContext(),
		isTokenExpired: keycloak.isTokenExpired.bind(keycloak),
		updateToken: keycloak.updateToken.bind(keycloak),
		onClickLogin,
		onClickRegister,
		onClickLogout,
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
				accessToken: keycloak.token,
				isAuthenticated: Boolean(keycloak.authenticated),
				userProfile,
				realmAccess: keycloak.realmAccess ?? null,
				resourceAccess: keycloak.resourceAccess ?? null,
			}));
		};

		initKeycloak().then(toggleLoading);
	});

	// TODO: improve
	const Loading = () => <span>Loading!!!</span>;

	// TODO: remove buttons
	return (
		<AuthnContext.Provider value={contextValue}>
			<Show when={!isLoading()} fallback={<Loading />}>
				<button on:click={onClickLogin}>Click here login!</button>
				<button on:click={onClickRegister}>Click here register!</button>
				<button on:click={onClickLogout}>Click here to logout!!</button>
				<span>
					isAuthenticated:&nbsp;
					{JSON.stringify(Boolean(contextValue.isAuthenticated))}
				</span>
				{props.children}
			</Show>
		</AuthnContext.Provider>
	);
};
