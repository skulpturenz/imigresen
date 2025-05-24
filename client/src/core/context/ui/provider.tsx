import { I18nProvider } from "@kobalte/core/i18n";
import { QueryClientProvider, type QueryClient } from "@tanstack/solid-query";
import { createUiContext } from "core/context/initializers";
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
import { repo } from "./automerge";
import { useStore, type UiSvc } from "./store";

export const UiContext = createContext<Accessor<UiSvc>>(createUiContext);

export const UiProvider: Component<ParentProps> = props => {
	const value = useStore();

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
