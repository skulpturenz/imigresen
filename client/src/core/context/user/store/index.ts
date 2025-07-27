import { invariant, once } from "es-toolkit";
import type { KeycloakProfile } from "keycloak-js";
import { createWithSignal } from "solid-zustand";
import { default as wretch } from "wretch";

export interface UserProfile {
	uuid: string;
	email: string;
	firstName: string;
	lastName: string;
	avatar: string; // TODO
	phoneNumber: string; // TODO
}

export interface UserPersonalDetails {
	uuid: string;
	relationshipStatusCode: string;
	genderCode: string;
	mobileNumber: string;
	currentAddress: {
		streetAddress: string;
		countryCode: string;
		state: string;
		city: string;
	};
	nationalityCountryCode: string;
}

export interface UserSvc {
	isInitialLoading: boolean;
	profile?: UserProfile | null;
	syncComplete?: boolean;
	actions: {
		init: (token?: string, profile?: KeycloakProfile | null) => void;
		completeSync: (token?: string) => void;
	};
}

export interface IM42Config {
	user: string;
	syncedAt?: Date | null;
}

const userApi = wretch(`${import.meta.env.VITE_API_BASE_URL}/user`);
const im42Api = wretch(`${import.meta.env.VITE_API_BASE_URL}/im42`);
const personalDetailsApi = wretch(
	`${import.meta.env.VITE_API_BASE_URL}/personal-details`,
);

export const useStore = createWithSignal<UserSvc>((set, get) => {
	return {
		isInitialLoading: true,
		profile: null,
		actions: {
			init: once(
				async (token?: string, profile?: KeycloakProfile | null) => {
					if (!token || !profile) {
						set({ isInitialLoading: false });

						return;
					}

					invariant(profile.email, "No email for keycloak profile");

					const searchParams = new URLSearchParams({
						email: profile.email,
					});

					const user = await userApi
						.auth(`Bearer ${token}`)
						.get(`?${searchParams.toString()}`)
						.json<UserProfile>();

					// Fetch personal details to get phone number
					const personalDetails = await personalDetailsApi
						.auth(`Bearer ${token}`)
						.get(`/user/${user.uuid}`)
						.notFound(() => null)
						.json<UserPersonalDetails | null>();

					// Update user profile with phone number from personal details
					set({
						profile: {
							...user,
							phoneNumber: personalDetails?.mobileNumber || "",
						},
					});

					const im42Config = await userApi
						.auth(`Bearer ${token}`)
						.get(`/${user.uuid}/config/im42`)
						// TODO: deep transform for responses
						.json<IM42Config>(res => ({
							...res,
							syncedAt: res.syncedAt
								? new Date(res.syncedAt)
								: null,
						}));

					set({
						syncComplete: Boolean(im42Config.syncedAt),
					});

					set({ isInitialLoading: false });
				},
			),
			completeSync: (token?: string) => {
				const profile = get().profile;
				if (!token || !profile?.uuid) {
					return;
				}

				im42Api
					.auth(`Bearer ${token}`)
					.put(`/user/${profile.uuid}/config/synced`);

				set({ syncComplete: true });
			},
		},
	};
});
