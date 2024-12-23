import { AuthnProviderMock } from "core/context/authn";
import { createAuthnContext } from "core/context/initializers";
import { UserProviderMock } from "core/context/user";
import { Shell } from "core/ui/shell";
import type { Meta, StoryObj as Story } from "storybook-solidjs";

export default {
	title: "core/ui/shell",
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Shell>;

export const Primary: Story<typeof Shell> = {
	render: () => <Shell>Page Content</Shell>,
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

export const Authenticated: Story<typeof Shell> = {
	render: () => <Shell>Page Content</Shell>,
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

export const Mobile: Story<typeof Shell> = {
	render: () => <Shell>Page Content</Shell>,
	decorators: Story => (
		<AuthnProviderMock>
			<UserProviderMock>
				<Story />
			</UserProviderMock>
		</AuthnProviderMock>
	),
};
