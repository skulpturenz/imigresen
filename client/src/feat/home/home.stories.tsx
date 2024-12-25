import { AuthnProviderMock } from "core/context/authn";
import { Shell } from "core/ui/shell";
import { withComponents } from "core/utils";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { HomeProviderMock } from "./context";
import { Home } from "./home";

export default {
	title: "feat/home",
	component: Home,
} satisfies Meta<typeof Home>;

export const Default: Story<typeof Home> = {
	render: Home,
	decorators: Story =>
		withComponents(Shell, HomeProviderMock, AuthnProviderMock)(Story),
};
