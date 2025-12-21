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
}

export interface GetAutomergeUrlVariables {
	user?: string;
	uuid: string;
}
