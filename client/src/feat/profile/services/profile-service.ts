import { assertEnv } from "core/utils/assert-env";
import type { ProfileForm } from "feat/profile/types";
import { default as wretch } from "wretch";

assertEnv(import.meta.env.VITE_API_BASE_URL, "API base url not specified");
const userApi = wretch(`${import.meta.env.VITE_API_BASE_URL}/user`);

export const profileService = (token?: string) => {
	const updateProfile = async (values: ProfileForm, userUuid: string) => {
		await userApi.auth(`Bearer ${token}`).put(values, `/${userUuid}`).res();
	};

	return {
		updateProfile,
	};
};
