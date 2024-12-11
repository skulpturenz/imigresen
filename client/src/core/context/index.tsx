import { type Component, type ParentProps } from "solid-js";
import { AuthnProvider } from "./authn/provider";
import { AuthzProvider } from "./authz";
import { FliptProvider } from "./flipt";
import { RouteProvider } from "./router";
import { UserProvider } from "./user";

export const Providers: Component<ParentProps> = props => {
	return (
		<AuthnProvider>
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
