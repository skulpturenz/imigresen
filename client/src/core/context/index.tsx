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

	invariant(authnProviderUrl, "Keycloak URL not specified");
	invariant(authnProviderRealm, "Keycloak realm not specified");
	invariant(authnProviderClientId, "Keycloak client ID not specified");

	return (
		<AuthnProvider
			url={authnProviderUrl}
			realm={authnProviderRealm}
			clientId={authnProviderClientId}>
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
