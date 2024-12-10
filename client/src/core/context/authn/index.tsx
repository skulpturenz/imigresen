import { default as Keycloak, type KeycloakProfile } from "keycloak-js";
import {
	createContext,
	onMount,
	type Component,
	type ParentProps,
} from "solid-js";
import { createStore } from "solid-js/store";

export interface AuthnContext {
	isAuthenticated: boolean;
	userProfile?: KeycloakProfile | null;
}

export const AuthnContext = createContext<AuthnContext>({
	isAuthenticated: false,
	userProfile: null,
});

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
	const [contextValue, setContextValue] = createStore<AuthnContext>({
		isAuthenticated: false,
		userProfile: null,
	});

	const keycloak = new Keycloak({
		url: props.url,
		realm: props.realm,
		clientId: props.clientId,
	});

	onMount(() => {
		const initKeycloak = async () => {
			await keycloak.init({
				onLoad: "check-sso",
				silentCheckSsoRedirectUri: `${location.origin}/silent-check-sso.html`,
				scope: "openid roles profile email address",
				redirectUri: props.loginRedirectUri,
			});

			if (!keycloak.authenticated) {
				return;
			}

			const userProfile = await keycloak.loadUserProfile();

			setContextValue(contextValue => ({
				...contextValue,
				isAuthenticated: Boolean(keycloak.authenticated),
				userProfile,
			}));
		};

		initKeycloak();
	});

	const onClickLogin = () => {
		keycloak.login({
			redirectUri: props.loginRedirectUri,
		});
	};

	const onClickRegister = () => {
		keycloak.register({
			redirectUri: props.loginRedirectUri,
		});
	};

	const onClickLogout = () => {
		keycloak.logout({
			redirectUri: props.logoutRedirectUri,
		});
	};

	// TODO: remove buttons
	return (
		<AuthnContext.Provider value={contextValue}>
			<button on:click={onClickLogin}>Click here login!</button>
			<button on:click={onClickRegister}>Click here register!</button>
			<button on:click={onClickLogout}>Click here to logout!!</button>
			{props.children}
		</AuthnContext.Provider>
	);
};
