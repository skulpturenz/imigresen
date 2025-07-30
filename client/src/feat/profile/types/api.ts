import type { ProfileForm } from "./form";

export type UpdateProfilePayload = {
	values: ProfileForm;
	uuid: string;
};