export const queryKeys = {
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
	getReferenceData: (token?: string) => [
		"feat",
		"my-passport-form",
		"getReferenceData",
		token,
	],
	getUserDetails: (token?: string) => [
		"core",
		"context",
		"user",
		"getUserDetails",
		token,
	],
	getPersonalDetails: (token?: string) => [
		"core",
		"context",
		"user",
		"getPersonalDetails",
		token,
	],
};
