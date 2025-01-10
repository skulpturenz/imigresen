import { boolean, date, number, object, string } from "yup";

export const schema = object({
	type: string(),
	applicationType: string(),
	fullName: string(),
	otherName: string(),
	identityCardNumber: string(),
	birthCertificateNumber: string(),
	dateOfBirth: date(),
	gender: string(),
	currentAddress: string(),
	postcode: string(),
	city: string(),
	state: string(),
	country: string(),
	height: number(), // meters
	relatonshipStatus: string(),
	mobileNumber: string(),
	currentPassportNumber: string(),
	isPassportLost: boolean(),
	isDependentRequest: boolean(),
	isPersonalDetailsValid: boolean(),
	isDependentPictureCurrent: boolean(),
	isAllInformationValid: boolean(),
	principalCaregiverFullName: string(),
	principalCaregiverIdentityCardNumber: string(),
	principalCaregiverSignature: string(),
});
