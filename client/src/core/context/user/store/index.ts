import { AUTHN_SVC_SUB_CONFIG_KEY } from "core/context/authn";
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
					});
				}

				const sub = localStorage.getItem(AUTHN_SVC_SUB_CONFIG_KEY);
				if (sub) {
					set({
						syncComplete:
							localStorage.getItem(`syncStatus:${sub}`) ===
							"complete",
					});
				}

				set({ isInitialLoading: false });
			}),
			completeSync: () => {
				// TODO: BE
				const sub = localStorage.getItem(AUTHN_SVC_SUB_CONFIG_KEY);
				if (!sub) {
					return;
				}

				localStorage.setItem(`syncStatus:${sub}`, "complete");

				set({ syncComplete: true });
			},
		},
	};
});
