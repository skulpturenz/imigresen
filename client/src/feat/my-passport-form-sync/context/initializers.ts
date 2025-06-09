import { noop } from "es-toolkit";
import type { MyPassportFormSyncSvc } from "./provider";

export const createMyPassportFormSyncContext = (): MyPassportFormSyncSvc => ({
	getLocalPublicItems: noop as any,
	getLocalPublicApplications: noop as any,
	transferPublicApplications: noop as any,
});
