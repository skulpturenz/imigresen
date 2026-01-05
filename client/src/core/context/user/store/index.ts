import { QueryClient } from "@tanstack/solid-query";
import { queryKeys } from "core/constants/query-keys";
import { normalizeResponse } from "core/data/transform-deep";
import { invariant, once } from "es-toolkit";
import type { KeycloakProfile } from "keycloak-js";
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

export interface UserSvcProps {
	queryClient: QueryClient;
}

export interface UserSvc {
	isInitialLoading: boolean;
	profile?: UserProfile | null;
	syncComplete?: boolean;
	actions: {
		init: (
			token?: string,
			profile?: KeycloakProfile | null,
		) => Promise<void>;
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

export const useStore = (props: UserSvcProps) => {
	const store = createWithSignal<UserSvc>((set, get) => {
		return {
			isInitialLoading: true,
			profile: null,
			actions: {
				init: once(
					async (
						token?: string,
						profile?: KeycloakProfile | null,
					) => {
						if (!token || !profile) {
							set({ isInitialLoading: false });

							return;
						}

						invariant(
							profile.email,
							"No email for keycloak profile",
						);

						const searchParams = new URLSearchParams({
							email: profile.email,
						});

						const userDetails = await props.queryClient.fetchQuery({
							queryKey: queryKeys.getUserDetails(token),
							queryFn: () =>
								userApi
									.auth(`Bearer ${token}`)
									.get(`?${searchParams.toString()}`)
									.json(normalizeResponse<UserProfile>),
						});

						const personalDetails =
							await props.queryClient.fetchQuery({
								queryKey: queryKeys.getPersonalDetails(token),
								queryFn: () =>
									personalDetailsApi
										.auth(`Bearer ${token}`)
										.get(`/user/${userDetails.uuid}`)
										.notFound(() => null)
										.json(
											normalizeResponse<UserPersonalDetails | null>,
										),
							});

						set({
							profile: {
								...userDetails,
								phoneNumber:
									personalDetails?.mobileNumber || "",
							},
						});

						const im42Config = await props.queryClient.fetchQuery({
							queryKey: queryKeys.getPersonalDetails(token),
							queryFn: () =>
								userApi
									.auth(`Bearer ${token}`)
									.get(`/${userDetails.uuid}/config/im42`)
									.json(normalizeResponse<IM42Config>)
									.catch(() => Object.create(null)),
						});

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

	return store(); // returns an accessor which IS reactive
};
