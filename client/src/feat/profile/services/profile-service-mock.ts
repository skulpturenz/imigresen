import { delay } from "es-toolkit";
import type { ProfileForm } from "feat/profile/types";

export const profileService = (_token?: string) => {
	const updateProfile = async (_values: ProfileForm, _userUuid: string) => {
		await delay(250);
		// Mock implementation - no actual API call
	};

	return {
		updateProfile,
	};
};