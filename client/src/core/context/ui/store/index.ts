import { QueryClient } from "@tanstack/solid-query";
import { AUTHN_SVC_SUB_CONFIG_KEY } from "core/context/authn";
import { once, partialRight } from "es-toolkit";
import { createWithSignal } from "solid-zustand";
import type { StateCreator } from "zustand";
import {
	createJSONStorage,
	persist,
	type PersistOptions,
} from "zustand/middleware";

export type Locale = "en-NZ" | "en-MY" | "ms-MY";

export type UiTheme = "light" | "dark" | "system";

export type UiMode = "default" | "zen";

export interface UiSvc {
	isInitialLoading: () => boolean;
	locale: Locale;
	theme: UiTheme;
	mode: UiMode;
	queryClient?: QueryClient | null;
	actions: {
		init: () => void;
		setTheme: (theme: UiTheme) => void;
		setMode: (mode: UiMode) => void;
		setLocale: (locale: Locale) => void;
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
	partialize: state => {
		const keysToIgnore: Set<keyof (UiSvc & UiSvcInternal)> = new Set([
			"queryClient",
			"actions",
			"hasHydrated",
		]);

		return Object.fromEntries(
			Object.entries(state).filter(
				([key]) =>
					!keysToIgnore.has(key as keyof UiSvc & UiSvcInternal),
			),
		) as UiSvc & UiSvcInternal;
	},
} satisfies PersistOptions<UiSvc & UiSvcInternal>);

export const useStore = createWithSignal<UiSvc & UiSvcInternal>(
	persistLocalStorage((set, get) => {
		return {
			isInitialLoading: () =>
				Boolean(!get()?.hasHydrated || !get().queryClient),
			locale: "en-NZ", // https://www.ietf.org/rfc/bcp/bcp47.txt
			// TODO: There is a state update issue here
			// if there is no persisted storage then `onRehydrateStorage`
			// calls `setHasHydrated` but it doesn't update for some reason
			// `get()` in `isInitialLoading` still has `hasHydrated` as `false`
			hasHydrated: true,
			theme: "dark" as UiTheme,
			mode: "default" as UiMode,
			queryClient: null,
			actions: {
				init: once(() => {
					const queryClient = new QueryClient({
						defaultOptions: {
							queries: {
								throwOnError: true,
								suspense: true,
							},
							mutations: {
								throwOnError: true,
							},
						},
					});

					set({ queryClient });
				}),
				setTheme: theme => set({ theme }),
				setMode: mode => set({ mode }),
				setHasHydrated: () => set({ hasHydrated: true }),
				setLocale: (locale: Locale) => set({ locale }),
			},
		};
	}),
);
