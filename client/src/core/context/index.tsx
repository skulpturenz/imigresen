import { MetaProvider } from "@solidjs/meta";
import { Shell } from "core/ui/shell";
import { type Component, type ParentProps } from "solid-js";
import { AuthnProvider } from "./authn";
import { AuthzProvider } from "./authz";
// import { FliptProviderMock as FliptProvider } from "./flipt";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { FliptProvider } from "./flipt";
import { RouterProvider } from "./router";
import { UiProvider } from "./ui";
import { UserProvider } from "./user";

export const Providers: Component<ParentProps> = props => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				throwOnError: true,
				suspense: true,
			},
			mutations: {
				throwOnError: true,
			},
		},
	});

	return (
		<MetaProvider>
			<QueryClientProvider client={queryClient}>
				<AuthnProvider>
					<UserProvider>
						<AuthzProvider>
							<FliptProvider>
								<RouterProvider>
									<UiProvider>
										<Shell>{props.children}</Shell>
									</UiProvider>
								</RouterProvider>
							</FliptProvider>
						</AuthzProvider>
					</UserProvider>
				</AuthnProvider>
			</QueryClientProvider>
		</MetaProvider>
	);
};
