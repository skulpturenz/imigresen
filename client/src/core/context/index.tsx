import type { Component, ParentProps } from "solid-js";
import { AuthzProvider } from "./authz";
import { FliptProvider } from "./flipt";
import { RouteProvider } from "./router";
import { UserProvider } from "./user";

export const Providers: Component<ParentProps> = props => (
	<UserProvider>
		<AuthzProvider>
			<FliptProvider>
				<RouteProvider>{props.children}</RouteProvider>
			</FliptProvider>
		</AuthzProvider>
	</UserProvider>
);
