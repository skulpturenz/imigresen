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
	importPassportApplications: (token?: string) => [
		"feat",
		"home",
		"importPassportApplications",
		token,
	],
	downloadPassportApplications: (token?: string) => [
		"feat",
		"home",
		"downloadPassportApplications",
		token,
	],
};
