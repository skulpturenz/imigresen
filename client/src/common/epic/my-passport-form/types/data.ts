import type { MyPassportForm } from "./form";
import type { MyPassportFormStatus } from "./my-passport-form-status.enum";

export interface RegisteredMyPassportForm extends MyPassportForm {
	uuid: string;
	automergeUrl: string;
	status: MyPassportFormStatus;
}
