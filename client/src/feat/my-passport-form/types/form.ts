import type { MyPassportFormMode } from "./my-passport-form-mode.enum";

export interface FormContext {
	mode: MyPassportFormMode;
}

export interface YupContext {
	context: FormContext;
}
