import { randCountry } from "@ngneat/falso";

export const fixture = {
	genderOptions: Object.entries({
		M: "Male",
		F: "Female",
	}) as [string, string][],
	relationshipStatusOptions: Object.entries({
		S: "Single",
		M: "Married",
		W: "Widowed",
	}) as [string, string][],
	countryOptions: Object.entries(
		[...new Set(randCountry({ length: 150 })), "Malaysia"].reduce(
			(acc, country) => ({
				...acc,
				[country.slice(2)]: country,
			}),
			Object.create(null),
		),
	) as [string, string][],
	personalDetailsStateOptions: [] as string[],
	addressDetailsStateOptions: [] as string[],
	requestTypeOptions: [
		["Damaged", "damaged"],
		["Expired", "expired"],
		["First", "first"],
		["Full", "full"],
		["Lost", "lost"],
		["OutdatedPicturesDependents", "outdated_pictures_dependents"],
	],
	documentTypeOptions: [
		["BorderIndonesia", "border_indonesia"],
		["BorderPhilippines", "border_philippines"],
		["EmergencyCertificate", "emergency_certificate"],
		["Limited", "limited"],
		["LimitedBrunei", "limited_brunei"],
		["LimitedSingapore", "limited_singapore"],
		["Pages32", "pages_32"],
		["Pages64", "pages_64"],
	],
};
