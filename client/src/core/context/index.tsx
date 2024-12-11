import { type Component, type ParentProps } from "solid-js";
import { AuthnProvider } from "./authn/provider";
import { AuthzProvider } from "./authz";
import { FliptProvider } from "./flipt/provider";
import { RouterProvider } from "./router/provider";
import { UserProvider } from "./user";

export const Providers: Component<ParentProps> = props => {
	return (
		<AuthnProvider>
			<UserProvider>
				<AuthzProvider>
					<FliptProvider>
						<RouterProvider>{props.children}</RouterProvider>
					</FliptProvider>
				</AuthzProvider>
			</UserProvider>
		</AuthnProvider>
	);
};
