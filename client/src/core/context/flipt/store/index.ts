import {
	FliptEvaluationClient,
	type Flag,
} from "@flipt-io/flipt-client-browser";
import { secondsToMilliseconds } from "date-fns";
import { invariant, once } from "es-toolkit";
import { createWithSignal } from "solid-zustand";

export interface FliptSvc {
	isInitialLoading: boolean;
	flags: Flag[];
	flipt?: FliptEvaluationClient | null;
	actions: {
		init: () => void;
		close: () => void;
	};
}

export interface FliptSvcInternal {
	timeout?: any;
}

export const useStore = createWithSignal<FliptSvc & FliptSvcInternal>(
	(set, get) => {
		const fliptUrl = import.meta.env.VITE_FLIPT_URL;
		const fliptClientToken = import.meta.env.VITE_FLIPT_CLIENT_TOKEN;
		const fliptNamespace = import.meta.env.VITE_FLIPT_NAMESPACE;

		invariant(fliptUrl, "Flipt URL not specified");
		invariant(fliptClientToken, "Flipt client token not specified");
		invariant(fliptNamespace, "Flipt namespace not specified");

		const interval = secondsToMilliseconds(120);

		return {
			isInitialLoading: true,
			flipt: null,
			flags: [],
			actions: {
				init: once(async () => {
					set({ isInitialLoading: true });

					const flipt = await FliptEvaluationClient.init(
						fliptNamespace,
						{
							url: fliptUrl,
							authentication: {
								clientToken: fliptClientToken,
							},
							reference: import.meta.env.MODE,
						},
					);

					const flags = flipt.listFlags();

					set({ flipt, flags });
					set({ isInitialLoading: false });

					const timeout = setInterval(() => {
						flipt.refresh().then(updated => {
							if (!updated) {
								return;
							}

							set({ flags: flipt.listFlags() });
						});
					}, interval);

					set({ timeout });
				}),
				close: () => {
					if (get().timeout) {
						clearTimeout(get().timeout);
					}
				},
			},
		};
	},
);
