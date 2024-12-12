import { createWithSignal } from "solid-zustand";

export type UiTheme = "light" | "dark";
export type UiMode = "default" | "zen";

export interface UiSvc {
	theme: UiTheme;
	mode: UiMode;
	actions: {
		setTheme: (theme: UiTheme) => void;
		setMode: (mode: UiMode) => void;
	};
}

export const useStore = createWithSignal<UiSvc>((set, _get) => {
	return {
		theme: "dark" as UiTheme,
		mode: "default" as UiMode,
		actions: {
			setTheme: theme => set({ theme }),
			setMode: mode => set({ mode }),
		},
	};
});
