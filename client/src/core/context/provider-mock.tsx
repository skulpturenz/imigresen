import { MetaProvider } from "@solidjs/meta";
import { Shell } from "core/ui/shell";
import { type Component, type ParentProps } from "solid-js";
import { AuthnProviderMock } from "./authn";
import { AuthzProvider } from "./authz";
import { FliptProviderMock } from "./flipt";
import { RouterProviderMock } from "./router";
import { UiProviderMock } from "./ui";
import { UserProviderMock } from "./user";

export const ProvidersMock: Component<ParentProps> = props => {
	return (
		<MetaProvider>
			<AuthnProviderMock>
				<UserProviderMock>
					<AuthzProvider>
						<FliptProviderMock>
							<RouterProviderMock>
								<UiProviderMock>
									<Shell>{props.children}</Shell>
								</UiProviderMock>
							</RouterProviderMock>
						</FliptProviderMock>
					</AuthzProvider>
				</UserProviderMock>
			</AuthnProviderMock>
		</MetaProvider>
	);
};
