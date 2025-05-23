import { I18nProvider } from "@kobalte/core";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { RepoContext } from "solid-automerge";
import {
	createEffect,
	mergeProps,
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { ToastList, ToastRegion } from "ui/toast";
import { repo } from "./automerge";
import { UiContext } from "./provider";
import { useStore, type UiSvc } from "./store";

export interface UiProviderMockProps {
	svc?: Accessor<UiSvc>;
}

export const UiProviderMock: Component<
	ParentProps<UiProviderMockProps>
> = props => {
	const value = useStore();
	const withDefaultProps = mergeProps(
		{
			svc: value,
		},
		props,
	);

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
		withDefaultProps.svc().actions.init();
	});

	return (
		<RepoContext.Provider value={repo}>
			<UiContext.Provider value={withDefaultProps.svc}>
				<Show when={!withDefaultProps.svc().isInitialLoading()}>
					<QueryClientProvider
						client={
							withDefaultProps.svc().queryClient as QueryClient
						}>
						<I18nProvider locale={withDefaultProps.svc().locale}>
							{withDefaultProps.children}

							<ToastRegion>
								<ToastList />
							</ToastRegion>
						</I18nProvider>
					</QueryClientProvider>
				</Show>
			</UiContext.Provider>
		</RepoContext.Provider>
	);
};
