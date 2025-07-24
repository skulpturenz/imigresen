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
		init: (profile?: KeycloakProfile | null) => void;
		completeSync: () => void;
	};
}

export interface IM42Config {
	user: string;
	syncedAt?: Date | null;
}

const userApi = wretch(`${import.meta.env.VITE_API_BASE_URL}/user`);
const im42Api = wretch(`${import.meta.env.VITE_API_BASE_URL}/im42`);

export const useStore = createWithSignal<UserSvc>((set, get) => {
	return {
		isInitialLoading: true,
		profile: null,
		actions: {
			init: once(async (profile?: KeycloakProfile | null) => {
				if (!profile) {
					set({ isInitialLoading: false });

					return;
				}

				invariant(profile.email, "No email for keycloak profile");

				const searchParams = new URLSearchParams({
					email: profile.email,
				});

				const user = await userApi
					.get(`?${searchParams.toString()}`)
					.json<UserProfile>();

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

				const im42Config = await userApi
					.get(`/${user.uuid}/config/im42`)
					.json<IM42Config>(res => ({
						...res,
						syncedAt: res.syncedAt ? new Date(res.syncedAt) : null,
					}));

				set({
					syncComplete: Boolean(im42Config.syncedAt),
				});

				set({ isInitialLoading: false });
			}),
			completeSync: () => {
				const profile = get().profile;
				if (!profile?.uuid) {
					return;
				}

				im42Api.put(`/user/${profile.uuid}/config/synced`);

				set({ syncComplete: true });
			},
		},
	};
});
