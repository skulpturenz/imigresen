import { noop } from "es-toolkit";
import type { HomeSvc } from "./provider";

export const createHomeContext = (): HomeSvc => ({
	getPassportApplications: noop as any,
});
