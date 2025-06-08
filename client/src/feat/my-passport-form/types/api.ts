export interface DropdownOptions {
	genderOptions: Record<string, string>;
	relationshipStatusOptions: Record<string, string>;
	countryOptions: Record<string, string>;
	personalDetailsStateOptions: string[];
	addressDetailsStateOptions: string[];
}

export interface RegisterApplicationVariables {
	automergeUrl: string;
	sub?: string;
}

export interface DeleteApplicationVariables {
	uuid: string;
	sub?: string;
}
