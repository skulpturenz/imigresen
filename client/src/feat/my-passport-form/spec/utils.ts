import {
	MyPassportFormMode,
	type YupContext,
} from "feat/my-passport-form/types";

export const isPublished = (options?: YupContext) =>
	options?.context.mode === MyPassportFormMode.Published;
