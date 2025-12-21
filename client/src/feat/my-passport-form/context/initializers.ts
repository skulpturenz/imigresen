import { noop } from "es-toolkit";
import type { MyPassportFormSvc } from "./provider";

export const createMyPassportFormContext = (): MyPassportFormSvc => ({
	registerApplication: noop as any,
	deleteApplication: noop as any,
	getReferenceData: noop as any,
	putIm42: noop as any,
});
