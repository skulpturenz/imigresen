import { AuthnProviderMock } from "core/context/authn";
import { Shell } from "core/ui/shell";
import { withParents } from "core/utils/utils";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { HomeProviderMock } from "./context";
import { Home } from "./home";
import { withI18n } from "./resources";

export default {
	title: "feat/home",
	component: Home,
} satisfies Meta<typeof Home>;

export const Default: Story<typeof Home> = {
	render: Home,
	decorators: Story => {
		const Component = withI18n(
			withParents(Shell, HomeProviderMock, AuthnProviderMock)(Story),
		);

		return <Component />;
	},
};
