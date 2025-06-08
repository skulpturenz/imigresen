import { noop } from "es-toolkit";
import type { MyPassportFormSyncSvc } from "./provider";

export const createMyPassportFormSyncContext = (): MyPassportFormSyncSvc => ({
	getPublicApplications: noop as any,
	transferPublicApplications: noop as any,
});
