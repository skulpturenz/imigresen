import { assertEnv } from "core/utils/assert-env";
import type { UserPersonalDetails, UserProfile } from "core/context/user/store";
import type { ProfileForm } from "feat/profile/types";
import { default as wretch } from "wretch";

assertEnv(import.meta.env.VITE_API_BASE_URL, "API base url not specified");
const userApi = wretch(`${import.meta.env.VITE_API_BASE_URL}/user`);
const personalDetailsApi = wretch(
	`${import.meta.env.VITE_API_BASE_URL}/personal-details`,
);

export const profileService = (token?: string) => {
	const updateProfile = async (
		values: ProfileForm["userDetails"],
		userUuid: string,
	) => {
		await userApi.auth(`Bearer ${token}`).put(values, `/${userUuid}`).res();
	};

	const getUserProfile = async (email: string): Promise<UserProfile> => {
		const searchParams = new URLSearchParams({ email });
		return userApi
			.auth(`Bearer ${token}`)
			.get(`?${searchParams.toString()}`)
			.json<UserProfile>();
	};

	const getUserPersonalDetails = async (uuid: string): Promise<UserPersonalDetails | null> => {
		return personalDetailsApi
			.auth(`Bearer ${token}`)
			.get(`/user/${uuid}`)
			.notFound(() => null)
			.json<UserPersonalDetails | null>();
	};

	return {
		updateProfile,
		getUserProfile,
		getUserPersonalDetails,
	};
};
