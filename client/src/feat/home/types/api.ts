export interface GetAutomergeUrlsVariables {
	user?: string;
}

export interface GetPassportApplicationsVariables {
	user?: string;
}

export interface ImportApplicationsVariables {
	files: File[];
	user?: string;
}

export type PromiseSettledResultValue<T> =
	T extends PromiseFulfilledResult<infer R> ? R : never;
