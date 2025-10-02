import type { MyPassportForm as MyPassportFormBase } from "./form";
import type { MyPassportFormStatus } from "./my-passport-form-status.enum";

export interface RegisteredMyPassportForm extends MyPassportFormBase {
	uuid: string;
	automergeUrl: string;
}

export interface DraftMyPassportForm extends RegisteredMyPassportForm {
	status: MyPassportFormStatus.Draft;
}

export interface CompletedMyPassportForm extends RegisteredMyPassportForm {
	status: MyPassportFormStatus.Ready;
	completedAt: Date;
}

export interface SubmittedMyPassportForm extends RegisteredMyPassportForm {
	status: MyPassportFormStatus.Submitted;
}

export interface IssuedMyPassportForm extends RegisteredMyPassportForm {
	passportNumber: string;
	status: MyPassportFormStatus.Issued;
	issuedAt: Date;
}

export type PersistedMyPassportForm =
	| DraftMyPassportForm
	| IssuedMyPassportForm
	| CompletedMyPassportForm
	| SubmittedMyPassportForm;
