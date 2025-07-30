import { noop } from "es-toolkit";
import type { ProfileSvc } from "./provider";

export const createProfileContext = (): ProfileSvc => ({
	updateProfile: noop as any,
});