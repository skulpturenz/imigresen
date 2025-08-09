import type { MyPassportFormMode } from "./my-passport-form-mode.enum";
import type { DropdownOptions } from "./ui";

export interface FormContext {
	mode: MyPassportFormMode;
	dropdownOptions?: DropdownOptions | null;
}

export interface YupContext {
	context: FormContext;
}
