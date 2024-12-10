import { invariant } from "es-toolkit";
import { type Component, type ParentProps } from "solid-js";
import { AuthnProvider } from "./authn";
import { AuthzProvider } from "./authz";
import { FliptProvider } from "./flipt";
import { RouteProvider } from "./router";
import { UserProvider } from "./user";

export const Providers: Component<ParentProps> = props => {
	const authnProviderUrl = import.meta.env.VITE_KEYCLOAK_URL;
	const authnProviderRealm = import.meta.env.VITE_KEYCLOAK_REALM;
	const authnProviderClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
	const authnProviderLoginRedirectUri = import.meta.env
		.VITE_KEYCLOAK_LOGIN_REDIRECT_URI;
	const authnProviderLogoutRedirectUri = import.meta.env
		.VITE_KEYCLOAK_LOGOUT_REDIRECT_URI;

	invariant(authnProviderUrl, "Keycloak URL not specified");
	invariant(authnProviderRealm, "Keycloak realm not specified");
	invariant(authnProviderClientId, "Keycloak client ID not specified");
	invariant(
		authnProviderLoginRedirectUri,
		"Keycloak login redirect uri not specified",
	);
	invariant(
		authnProviderLogoutRedirectUri,
		"Keycloak logout redirect uri not specified",
	);

	return (
		<AuthnProvider
			url={authnProviderUrl}
			realm={authnProviderRealm}
			clientId={authnProviderClientId}
			loginRedirectUri={authnProviderLoginRedirectUri}
			logoutRedirectUri={authnProviderLogoutRedirectUri}>
			<UserProvider>
				<AuthzProvider>
					<FliptProvider>
						<RouteProvider>{props.children}</RouteProvider>
					</FliptProvider>
				</AuthzProvider>
			</UserProvider>
		</AuthnProvider>
	);
};
