import { AUTHN_SVC_SUB_CONFIG_KEY } from "core/context/authn";
import { invariant, once } from "es-toolkit";
import type { KeycloakProfile } from "keycloak-js";
import { createWithSignal } from "solid-zustand";
import { default as wretch } from "wretch";

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

const userApi = wretch("/user");

export const useStore = createWithSignal<UserSvc>((set, _get) => {
	return {
		isInitialLoading: true,
		profile: null,
		actions: {
			init: once(async (profile?: KeycloakProfile | null) => {
				if (!profile) {
					return;
				}

				invariant(profile.email, "No email for keycloak profile");

				const searchParams = new URLSearchParams({
					email: profile.email,
				});

				const user = await userApi
					.get(`?${searchParams.toString()}`)
					// TODO: types
					.json<Record<string, any>>();

				set({
					profile: {
						uuid: user.uuid,
						fullName: [profile.firstName, profile.lastName]
							.filter(Boolean)
							.join(" "),
						phoneNumber: "", // TODO
						avatar: "", // TODO
					},
				});

				// TODO: add BE endpoint
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
				// TODO: add BE endpoint
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
