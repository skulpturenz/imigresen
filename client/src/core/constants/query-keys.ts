export const queryKeys = {
	getAutomergeUrls: (token?: string) => [
		"feat",
		"home",
		"passportApplications",
		"automergeUrls",
		token,
	],
	getPassportApplications: (token?: string) => [
		"feat",
		"home",
		"passportApplications",
		token,
	],
	downloadPassportApplications: (token?: string) => [
		"feat",
		"home",
		"downloadPassportApplications",
		token,
	],
};
