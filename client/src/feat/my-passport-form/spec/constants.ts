export const constants = {
	regex: {
		alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
		myKadNumber: /\d{12}/,
		numeric: /[0-9]+/,
	},
	fieldConstraints: {
		nameMinChars: 1,
		nameMaxChars: 60,
		heightMin: 1, // m
		heightMax: 300, // cm
	},
};
