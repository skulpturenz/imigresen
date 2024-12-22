import { boolean, number, object, string } from "yup";

export const schema = object({
	documentType: string().required(),
	requestType: string(),
	currentPassportNumber: string(),
	personalDetails: object({
		fullName: string(),
		otherName: string(),
		identityCardNumber: string(),
		birthDocumentNumber: string(),
		stateOfBirth: string(),
		gender: number(),
		currentAddress: string(),
		postcode: string(),
		city: string(),
		state: string(),
		height: number(),
		relationshipStatus: string(),
	}),
	declaration: object({
		affirmValidity: boolean(),
		affirmCurrentPassportStatus: boolean(),
		affirmChildrenPictures: boolean(),
		affirmTrueAndValid: boolean(),
		signature: string(), // base64
		affirmChildrenParentName: string(),
		affirmChildrenParentIdentityCardNumber: string(),
		affirmChildrenParentSignature: string(), // base64
	}),
});
