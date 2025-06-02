export type MyPassportForm = {
	personalDetails: PersonalDetails;
	addressDetails: AddressDetails;
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

export type AddressDetails = {
	streetAddress: string;
	postcode: string;
	city: string;
	state: string;
	country: string;
};
