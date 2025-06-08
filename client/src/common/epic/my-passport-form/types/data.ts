import type { MyPassportForm } from "./form";

export interface PassportApplication extends MyPassportForm {
	uuid: string;
	automergeUrl: string;
}
