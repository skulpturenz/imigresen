import {
	ColorModeProvider,
	ColorModeScript,
	localStorageManager,
} from "@kobalte/core";
import { I18nProvider } from "@kobalte/core/i18n";
import { createUiContext } from "core/context/initializers";
import {
	createContext,
	Show,
	type Component,
	type ParentProps,
} from "solid-js";
import { ToastList, ToastRegion } from "ui/toast";
import { useStore, type UiSvc } from "./store";

export const UiContext = createContext<UiSvc>(createUiContext());

export const UiProvider: Component<ParentProps> = props => {
	const value = useStore();

	return (
		<UiContext.Provider value={value()}>
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
