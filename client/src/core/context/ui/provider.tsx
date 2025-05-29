import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { I18nProvider } from "@kobalte/core/i18n";
import { QueryClientProvider, type QueryClient } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { createUiContext } from "core/context/initializers";
import { useContext } from "core/context/utils";
import { RepoContext } from "solid-automerge";
import {
	createContext,
	createEffect,
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { ToastList, ToastRegion } from "ui/toast";
import { network, repo } from "./automerge";
import { useStore, type UiSvc } from "./store";

export const UiContext = createContext<Accessor<UiSvc>>(createUiContext);

export const UiProvider: Component<ParentProps> = props => {
	const value = useStore();
	const authnContext = useContext(AuthnContext);

	createEffect(() => {
		if (value().isInitialLoading()) {
			return;
		}

		if (!import.meta.env.SSR) {
			const root = window.document.documentElement;

			root.classList.remove("light", "dark");

			if (value().theme === "system") {
				const systemTheme = window.matchMedia(
					"(prefers-color-scheme: dark)",
				).matches
					? "dark"
					: "light";

				root.classList.add(systemTheme);

				return;
			}

			root.classList.add(value().theme);
		}
	});

	createEffect(() => {
		// if authenticated then we want automerge sync
		if (authnContext().keycloak?.authenticated) {
			network.push(
				new BrowserWebSocketClientAdapter(
					import.meta.env.VITE_AUTOMERGE_WSS,
				),
			);

			return;
		}

		// otherwise remove all network adapters if any
		// automerge allows for the array to be changed at runtime but we can't reassign it
		while (network.length) {
			network.pop();
		}
	});

	onMount(() => {
		value().actions.init();
	});

	return (
		<UiContext.Provider value={value}>
			<Show when={!value().isInitialLoading()}>
				<RepoContext.Provider value={repo}>
					<QueryClientProvider
						client={value().queryClient as QueryClient}>
						<I18nProvider locale={value().locale}>
							{props.children}

							<ToastRegion>
								<ToastList />
							</ToastRegion>
						</I18nProvider>
					</QueryClientProvider>
				</RepoContext.Provider>
			</Show>
		</UiContext.Provider>
	);
};
