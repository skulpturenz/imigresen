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
	getUserProfile: (token?: string, email?: string) => [
		"core",
		"user",
		"profile",
		token,
		email,
	],
	getUserPersonalDetails: (token?: string, uuid?: string) => [
		"core",
		"user",
		"personalDetails",
		token,
		uuid,
	],
};
