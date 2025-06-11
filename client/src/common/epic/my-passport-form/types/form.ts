import type { MyPassportFormVersion } from "./my-passport-form-version.enum";

export type MyPassportForm = {
	personalDetails: PersonalDetails;
	addressDetails: AddressDetails;
	applicationDetails: ApplicationDetails;
	previousDocuments: PreviousDocuments;
	declaration: Declaration;
	version?: MyPassportFormVersion;
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
	countryCode: string;
};

export type ApplicationDetails = {
	documentType: string;
	requestType: string;
	myKadNumber: string;
	birthDocumentNumber: string;
};

export type PreviousDocuments = {
	dependentCaregiverFirstName?: string;
	dependentCaregiverLastName?: string;
	dependentCaregiverMyKadNumber?: string;
	dependentCaregiverSignature?: string;
	previousDocumentNumber?: string;
};

export type Declaration = {
	isDetailsCorrect?: boolean;
	confirmPreviousDocumentNumber?: string; // only if `previousDocuments.previousDocumentNumber`
	declareTrueAndCorrect: boolean;
	isLiable?: boolean;
};
