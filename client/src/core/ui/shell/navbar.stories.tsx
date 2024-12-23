import { AuthnProviderMock } from "core/context/authn";
import { createAuthnContext } from "core/context/initializers";
import { UserProviderMock } from "core/context/user";
import { Navbar } from "core/ui/shell";
import type { Meta, StoryObj as Story } from "storybook-solidjs";

export default {
	title: "core/ui/navbar",
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Navbar>;

export const Default: Story<typeof Navbar> = {
	render: Navbar,
	decorators: Story => (
		<AuthnProviderMock>
			<UserProviderMock>
				<div class="w-[50vw]">
					<Story />
				</div>
			</UserProviderMock>
		</AuthnProviderMock>
	),
};

export const Authenticated: Story<typeof Navbar> = {
	render: Navbar,
	decorators: Story => (
		<AuthnProviderMock
			svc={() => ({
				...createAuthnContext(),
				isInitialLoading: false,
				keycloak: {
					authenticated: true,
				} as any,
			})}>
			<UserProviderMock>
				<div class="w-[50vw]">
					<Story />
				</div>
			</UserProviderMock>
		</AuthnProviderMock>
	),
};

export const Mobile: Story<typeof Navbar> = {
	render: Navbar,
	decorators: Story => (
		<AuthnProviderMock>
			<UserProviderMock>
				<Story />
			</UserProviderMock>
		</AuthnProviderMock>
	),
};
