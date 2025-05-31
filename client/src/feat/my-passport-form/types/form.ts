export type MyPassportForm = {
	personalDetails: PersonalDetails;
};

export type PersonalDetails = {
	firstName: string;
	lastName: string;
	nickName: string;
	genderCode: string;
	dateOfBirth: Date;
	countryOfBirthCode: string; // only if outside of malaysia
	stateOfBirth?: string;
	height: number;
	emailAddress: string;
	mobileNumber: string;
	relationshipStatusCode: string;
};
