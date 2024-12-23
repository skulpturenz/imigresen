import {
	ColorModeProvider,
	ColorModeScript,
	I18nProvider,
	localStorageManager,
} from "@kobalte/core";
import {
	createEffect,
	mergeProps,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { ToastList, ToastRegion } from "ui/toast";
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

	return (
		<UiContext.Provider value={withDefaultProps.svc}>
			<Show when={!withDefaultProps.svc().isInitialLoading()}>
				<I18nProvider locale={withDefaultProps.svc().locale}>
					<ColorModeScript storageType="localStorage" />

					<ColorModeProvider
						initialColorMode={withDefaultProps.svc().theme}
						storageManager={localStorageManager}>
						{withDefaultProps.children}

						<ToastRegion>
							<ToastList />
						</ToastRegion>
					</ColorModeProvider>
				</I18nProvider>
			</Show>
		</UiContext.Provider>
	);
};
