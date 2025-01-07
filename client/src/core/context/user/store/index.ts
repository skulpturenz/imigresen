import { once } from "es-toolkit";
import { createWithSignal } from "solid-zustand";

export interface UserProfile {
	uuid: string;
	avatar: string;
	fullName: string;
	phoneNumber: string;
}
export interface UserSvc {
	isInitialLoading: boolean;
	profile?: UserProfile | null;
	actions: {
		init: () => void;
	};
}

export const useStore = createWithSignal<UserSvc>((set, _get) => {
	return {
		isInitialLoading: true,
		profile: null,
		actions: {
			init: once(async () => {
				set({ isInitialLoading: false });
			}),
		},
	};
});
