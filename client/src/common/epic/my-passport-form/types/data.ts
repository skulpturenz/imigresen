import type { MyPassportForm } from "./form";

export interface RegisteredMyPassportForm extends MyPassportForm {
	uuid: string;
	automergeUrl: string;
	issuedAt?: Date;
}
