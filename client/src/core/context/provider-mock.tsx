import { MetaProvider } from "@solidjs/meta";
import { Shell } from "core/ui/shell";
import { type Component, type ParentProps } from "solid-js";
import { AuthnProviderMock } from "./authn";
import { AuthzProvider } from "./authz";
import { FliptProviderMock } from "./flipt";
import { RouterProviderMock } from "./router";
import { UiProviderMock } from "./ui";
import { UserProvider } from "./user";

export const ProvidersMock: Component<ParentProps> = props => {
	return (
		<MetaProvider>
			<AuthnProviderMock>
				<UserProvider>
					<AuthzProvider>
						<FliptProviderMock>
							<RouterProviderMock>
								<UiProviderMock>
									<Shell>{props.children}</Shell>
								</UiProviderMock>
							</RouterProviderMock>
						</FliptProviderMock>
					</AuthzProvider>
				</UserProvider>
			</AuthnProviderMock>
		</MetaProvider>
	);
};
