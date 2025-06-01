import { randCountry } from "@ngneat/falso";

export default {
	genderOptions: {
		Female: "Female",
		Male: "Male",
	},
	relationshipStatusOptions: {
		Single: "S",
		Married: "M",
		Widowed: "W",
	},
	countryOptions: [
		...new Set(randCountry({ length: 150 })),
		"Malaysia",
	].reduce(
		(acc, country) => ({
			...acc,
			[country]: country,
		}),
		Object.create(null),
	),
};
