export const queryKeys = {
	getReferenceData: (token?: string) => [
		"feat",
		"my-passport-form",
		"getReferenceData",
		token,
	],
	getReferenceDataStates: (country: string, token?: string) => [
		"feat",
		"my-passport-form",
		"getReferenceDataStates",
		country,
		token,
	],
	getAddressAutofill: (search: string, userId: string) => [
		"feat",
		"my-passport-form",
		"getAddressAutofill",
		search,
		userId,
	],
};
