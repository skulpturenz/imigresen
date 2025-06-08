export interface RegisterApplicationVariables {
	automergeUrl: string;
	sub?: string;
}

export interface DeleteApplicationVariables {
	uuid: string;
	sub?: string;
}

export interface TransferPublicApplicationsVariables {
	automergeUrls: string[];
	sub?: string;
}
