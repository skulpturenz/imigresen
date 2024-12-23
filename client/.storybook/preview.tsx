/** @jsxImportSource solid-js */

import { DEFAULT_VIEWPORT, INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import { startCase } from "es-toolkit";
import { type Component, type ParentProps } from "solid-js";
import type { Preview } from "storybook-solidjs";
import "../src/core/assets/tailwind.css";
import "../src/core/assets/theme.css";
import { UiContext, UiProvider } from "../src/core/context/ui";
import { useContext } from "../src/core/context/utils";
import { buttonVariants } from "../src/ui/button";
import { cn } from "../src/ui/utils";
import { darkTheme } from "./theme";

const preview: Preview = {
	parameters: {
		docs: {
			theme: darkTheme,
		},
		controls: {
			matchers: {
				date: /Date$/i,
			},
		},
		layout: "centered",
		viewport: {
			viewports: INITIAL_VIEWPORTS,
			defaultViewport: DEFAULT_VIEWPORT,
		},
	},
	decorators: [
		(Story, context) => {
			const Layout: Component<ParentProps> = props => {
				const uiContext = useContext(UiContext);

				const getNextTheme = () => {
					if (uiContext().theme === "light") {
						return "dark";
					}

					return "light";
				};

				const toggleTheme = () => {
					uiContext().actions.setTheme(getNextTheme());
				};

				return (
					<div class="flex flex-col gap-4 items-center">
						<div>{props.children}</div>

						{context.parameters.toggleTheme !== false && (
							<button
								class={cn(
									buttonVariants({ variant: "default" }),
									"w-full",
								)}
								onClick={toggleTheme}>
								{startCase(getNextTheme())} mode
							</button>
						)}
					</div>
				);
			};

			return (
				<UiProvider>
					<Layout>
						<Story />
					</Layout>
				</UiProvider>
			);
		},
	],
};

export default preview;
