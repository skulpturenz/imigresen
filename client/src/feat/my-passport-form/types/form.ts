import type { Accessor } from "solid-js";
import type { MyPassportFormMode } from "./my-passport-form-mode.enum";
import type { DropdownOptions } from "./ui";

export interface FormContext {
	mode: MyPassportFormMode;
	dropdownOptions?: Accessor<DropdownOptions | null>;
}

export interface YupContext {
	context: FormContext;
}
