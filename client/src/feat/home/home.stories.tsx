import { AuthnProviderMock } from "core/context/authn";
import { makeWithI18n } from "core/context/i18n";
import { Shell } from "core/ui/shell";
import { withComponents } from "core/utils";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { HomeProviderMock } from "./context";
import { Home } from "./home";
import { fetcher } from "./resources";

const withI18n = makeWithI18n({ fetcher });

export default {
	title: "feat/home",
	component: Home,
} satisfies Meta<typeof Home>;

export const Default: Story<typeof Home> = {
	render: Home,
	decorators: Story => {
		const Component = withI18n(
			withComponents(Shell, HomeProviderMock, AuthnProviderMock)(Story),
		);

		return <Component />;
	},
};
