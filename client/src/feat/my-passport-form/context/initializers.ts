import type { MyPassportFormSvc } from "./provider";

export const createMyPassportFormContext = (): MyPassportFormSvc => ({
	automergeRepo: Object.create(null),
});
