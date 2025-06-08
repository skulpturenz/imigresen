import { once } from "es-toolkit";
import type { KeycloakProfile } from "keycloak-js";
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
	syncComplete?: boolean;
	actions: {
		// TODO: once BE is up remove dependence on KC
		init: (profile?: KeycloakProfile | null) => void;
		completeSync: () => void;
	};
}

export const useStore = createWithSignal<UserSvc>((set, _get) => {
	return {
		isInitialLoading: true,
		profile: null,
		syncComplete: false,
		actions: {
			init: once(async (profile?: KeycloakProfile | null) => {
				// TODO: once BE is up remove dependence on KC
				if (profile) {
					set({
						profile: {
							uuid: profile?.id ?? "",
							fullName: [profile.firstName, profile.lastName]
								.filter(Boolean)
								.join(" "),
							phoneNumber: "",
							avatar: "",
						},
						isInitialLoading: false,
					});

					return;
				}

				// TODO: BE
				const syncStatus = localStorage.getItem("syncStatus");
				set({ syncComplete: syncStatus === "complete" });

				set({ isInitialLoading: false });
			}),
			completeSync: () => {
				localStorage.setItem("syncStatus", "complete");

				set({ syncComplete: true });
			},
		},
	};
});
