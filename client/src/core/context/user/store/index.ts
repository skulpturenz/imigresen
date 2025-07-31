import { useQuery } from "@tanstack/solid-query";
import { queryKeys } from "core/constants/query-keys";
import { invariant, once } from "es-toolkit";
import type { KeycloakProfile } from "keycloak-js";
import { createEffect } from "solid-js";
import { createWithSignal } from "solid-zustand";
import { default as wretch } from "wretch";

export interface UserProfile {
	uuid: string;
	email: string;
	firstName: string;
	lastName: string;
	avatarHref?: string;
	phoneNumber?: string;
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

					const qUser = useQuery(() => ({
						queryKey: queryKeys.getUserDetails(token),
						queryFn: () =>
							userApi
								.auth(`Bearer ${token}`)
								.get(`?${searchParams.toString()}`)
								.json<UserProfile>(),
					}));

					const qPersonalDetails = useQuery(() => ({
						queryKey: queryKeys.getPersonalDetails(token),
						queryFn: () =>
							personalDetailsApi
								.auth(`Bearer ${token}`)
								.get(`/user/${qUser.data?.uuid}`)
								.notFound(() => null)
								.json<UserPersonalDetails | null>(),
						enabled: Boolean(qUser.data),
					}));

					const qIm42Config = useQuery(() => ({
						queryKey: queryKeys.getPersonalDetails(token),
						queryFn: () =>
							userApi
								.auth(`Bearer ${token}`)
								.get(`/${qUser.data?.uuid}/config/im42`)
								// TODO: deep transform for responses
								.json<IM42Config>(res => ({
									...res,
									syncedAt: res.syncedAt
										? new Date(res.syncedAt)
										: null,
								})),
						enabled: Boolean(qUser.data),
					}));

					createEffect(() => {
						if (!qUser.data || !qPersonalDetails.data) {
							return;
						}

						set({
							profile: {
								...qUser.data,
								phoneNumber:
									qPersonalDetails.data?.mobileNumber || "",
							},
						});
					});

					createEffect(() => {
						if (!qUser.data || !qIm42Config.data) {
							return;
						}

						set({
							syncComplete: Boolean(qIm42Config.data.syncedAt),
						});
					});

					createEffect(() => {
						if (
							!qUser.data ||
							!qPersonalDetails.data ||
							!qIm42Config.data
						) {
							return;
						}

						set({ isInitialLoading: false });
					});
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
