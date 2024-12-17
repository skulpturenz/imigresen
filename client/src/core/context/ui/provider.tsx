import {
	ColorModeProvider,
	ColorModeScript,
	localStorageManager,
} from "@kobalte/core";
import { I18nProvider } from "@kobalte/core/i18n";
import { createUiContext } from "core/context/initializers";
import {
	createContext,
	createEffect,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { ToastList, ToastRegion } from "ui/toast";
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

	return (
		<UiContext.Provider value={value}>
			<Show when={!value().isInitialLoading()}>
				<I18nProvider locale={value().locale}>
					<ColorModeScript storageType="localStorage" />

					<ColorModeProvider
						initialColorMode={value().theme}
						storageManager={localStorageManager}>
						{props.children}

						<ToastRegion>
							<ToastList />
						</ToastRegion>
					</ColorModeProvider>
				</I18nProvider>
			</Show>
		</UiContext.Provider>
	);
};
