import { default as Keycloak, type KeycloakProfile } from "keycloak-js";
import {
	createContext,
	onMount,
	type Component,
	type ParentProps,
} from "solid-js";
import { createStore } from "solid-js/store";

export interface AuthnContext {
	redirectUri?: string | null;
	userProfile?: KeycloakProfile | null;
}

export const AuthnContext = createContext<AuthnContext>({
	redirectUri: null,
	userProfile: null,
});

export interface AuthnProviderProps {
	url: string;
	realm: string;
	clientId: string;
	redirectUri: string;
}

export const AuthnProvider: Component<
	ParentProps<AuthnProviderProps>
> = props => {
	const [contextValue, setContextValue] = createStore<AuthnContext>(
		Object.create(null),
	);

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
				redirectUri: props.redirectUri,
			});

			if (!keycloak.authenticated) {
				return;
			}

			const userProfile = await keycloak.loadUserProfile();

			setContextValue(contextValue => ({
				...contextValue,
				isAuthenticated: keycloak.authenticated,
				userProfile,
			}));
		};

		initKeycloak();
	});

	const onClickLogin = () => {
		keycloak.login({
			redirectUri: props.redirectUri,
		});
	};

	const onClickRegister = () => {
		keycloak.register({
			redirectUri: props.redirectUri,
		});
	};

	return (
		<AuthnContext.Provider value={contextValue}>
			<button on:click={onClickLogin}>Click here login!</button>
			<button on:click={onClickRegister}>Click here register!</button>
			{props.children}
		</AuthnContext.Provider>
	);
};
