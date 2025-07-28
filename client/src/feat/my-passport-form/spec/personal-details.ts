import { object, string } from "yup";

export const personalDetails = object({
	firstName: string(),
	lastName: string(),
	nickName: string(),
	genderCode: string(),
	dateOfBirth: string(),
	countryOfBirthCode: string(),
	stateOfBirth: string(),
	height: string(),
	emailAddress: string(),
	mobileNumber: string(),
	relationshipStatusCode: string(),
});
