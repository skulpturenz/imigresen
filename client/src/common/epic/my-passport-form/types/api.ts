import type { DropdownOptions } from "feat/my-passport-form/types";
import type { MyPassportForm } from "./form";

export interface RegisterApplicationVariables {
	automergeUrl: string;
	user?: string;
}

export interface DeleteApplicationVariables {
	uuid: string;
	user?: string;
}

export interface PutApplicationVariables {
	uuid: string;
	user: string;
	automergeUrl: string;
	formValues: MyPassportForm;
	dropdownOptions: DropdownOptions;
}

export interface GetAutomergeUrlVariables {
	user?: string;
	uuid: string;
}

export interface PutPopulateVariables {
	automergeUrl: string;
	formValues: MyPassportForm;
	dropdownOptions: DropdownOptions;
}
