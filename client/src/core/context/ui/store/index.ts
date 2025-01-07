import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/solid-query";
import { type Persister } from "@tanstack/solid-query-persist-client";
import { AUTHN_SVC_SUB_CONFIG_KEY } from "core/context/authn";
import { once, partialRight, toMerged } from "es-toolkit";
import { createWithSignal } from "solid-zustand";
import type { StateCreator } from "zustand";
import {
	createJSONStorage,
	persist,
	type PersistOptions,
} from "zustand/middleware";

export type Locale = "en-US" | "en-MY" | "ms-MY";

export type UiTheme = "light" | "dark" | "system";

export type UiMode = "default" | "zen";

export interface UiSvc {
	isInitialLoading: () => boolean;
	locale: Locale;
	theme: UiTheme;
	mode: UiMode;
	queryClient?: QueryClient | null;
	queryClientPersistor?: Persister | null;
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
	merge: (persistedState, currentState) => {
		// take out state which is not serializable
		const {
			queryClient: _queryClient,
			actions: _actions,
			...rest
		} = persistedState as UiSvc & UiSvcInternal;

		return toMerged(currentState, rest) as UiSvc & UiSvcInternal;
	},
} satisfies PersistOptions<UiSvc & UiSvcInternal>);

export const useStore = createWithSignal<UiSvc & UiSvcInternal>(
	persistLocalStorage((set, get) => {
		return {
			isInitialLoading: () =>
				Boolean(
					!get()?.hasHydrated ||
						!get().queryClient ||
						!get().queryClientPersistor,
				),
			locale: "en-US", // https://www.ietf.org/rfc/bcp/bcp47.txt
			hasHydrated: false,
			theme: "dark" as UiTheme,
			mode: "default" as UiMode,
			queryClient: null,
			queryClientPersistor: null,
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

					const queryClientPersistor = createSyncStoragePersister({
						storage: window.localStorage,
					});

					set({ queryClient });
					set({ queryClientPersistor });
				}),
				setTheme: theme => set({ theme }),
				setMode: mode => set({ mode }),
				setHasHydrated: () => set({ hasHydrated: true }),
				setLocale: (locale: Locale) => set({ locale }),
			},
		};
	}),
);
