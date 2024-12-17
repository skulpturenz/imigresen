import { useColorMode } from "@kobalte/core";
import { AUTHN_SVC_SUB_CONFIG_KEY } from "core/context/authn";
import { partialRight } from "es-toolkit";
import { createWithSignal } from "solid-zustand";
import type { StateCreator } from "zustand";
import {
	createJSONStorage,
	persist,
	type PersistOptions,
} from "zustand/middleware";

export type UiTheme = "light" | "dark" | "system";

export type UiMode = "default" | "zen";

export interface UiSvc {
	isInitialLoading: () => boolean;
	locale: string;
	theme: UiTheme;
	mode: UiMode;
	actions: {
		setTheme: (theme: UiTheme) => void;
		setMode: (mode: UiMode) => void;
	};
}

export interface UiSvcInternal {
	hasHydrated: boolean;
	actions: {
		setHasHydrated?: () => void;
	};
}

const persistLocalStorage: (
	initializer: StateCreator<UiSvc & UiSvcInternal, [], []>,
) => StateCreator<UiSvc & UiSvcInternal, [], []> = partialRight(persist, {
	name: `imigresen-${import.meta.env.MODE}-${localStorage?.getItem(AUTHN_SVC_SUB_CONFIG_KEY) || "default"}`,
	storage: createJSONStorage(() => localStorage),
	version: 1,
	onRehydrateStorage: state => () => state.actions.setHasHydrated?.(),
} satisfies PersistOptions<UiSvc & UiSvcInternal>);

export const useStore = createWithSignal<UiSvc & UiSvcInternal>(
	persistLocalStorage((set, get) => {
		return {
			isInitialLoading: () => !get()?.hasHydrated,
			locale: "en-US", // https://www.ietf.org/rfc/bcp/bcp47.txt
			hasHydrated: false,
			theme: "dark" as UiTheme,
			mode: "default" as UiMode,
			actions: {
				setTheme: theme => {
					const { setColorMode } = useColorMode();

					set({ theme });
					setColorMode(theme);
				},
				setMode: mode => set({ mode }),
				setHasHydrated: () => set({ hasHydrated: true }),
			},
		};
	}),
);
