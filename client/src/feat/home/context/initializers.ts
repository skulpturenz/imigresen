import { noop } from "es-toolkit";
import type { HomeSvc } from "./provider";

export const createHomeContext = (): HomeSvc => ({
	getAutomergeUrls: noop as any,
	getPassportApplications: noop as any,
	registerApplication: noop as any,
	downloadApplications: noop as any,
	importApplications: noop as any,
});
