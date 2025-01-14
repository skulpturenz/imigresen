export interface TravelDocumentApplication {
	documentType: TravelDocumentType;
	requestType: TravelDocumentRequestType;
	isDependentRequest?: boolean;
	fullName: string;
	otherName: string;
	identityCardNumber: string;
	birthCertificateNumber: string;
	dateOfBirth: Date;
	gender: Gender;
	currentStreetAddress: string;
	postcode: string;
	city: string;
	state: string;
	country: string;
	height: number;
	relationshipStatus: RelationshipStatus;
	mobileNumber: string;
	currentPassportNumber: string;
	isPersonalDetailsValid: boolean;
	isDependentPictureValid?: boolean; // only if `isDependentRequest`
	isAllInformationValid: boolean;
	principalCaregiverFullName?: string; // only if `isDependentRequest`
	principalCaregiverIdentityCardNumber?: string; // only if `isDependentRequest`
	principalCaregiverSignature?: string; // only if `isDependentRequest`
}

// TODO: BE
export enum TravelDocumentType {
	// https://www.malaysia.gov.my/portal/subcategory/1649
	Passport64 = "pasport-64-mukasurat",
	// https://www.malaysia.gov.my/portal/subcategory/1649
	Passport32 = "pasport-32-mukasurat",
	// TODO
	PassportLimitedSingapore = "pasport-terhad-singapore",
	// https://www.malaysia.gov.my/portal/subcategory/1649
	PassportLimitedBrunei = "pasport-terhad-brunei",
	// TODO
	PassportBorderPhilippines = "pasport-sempadan-filipina",
	// https://www.malaysia.gov.my/portal/content/27687
	PassportCrossingBorderIndonesia = "pasport-menyeberang-sempadan-indonesia",
	// https://www.malaysia.gov.my/portal/subcategory/1650
	TravelDocumentLimited = "dokumen-perjalanan-terhad",
	// https://www.malaysia.gov.my/portal/subcategory/1649
	EmergencyCertificate = "sijil-perakuan-cemas",
}

// TODO: BE
export enum TravelDocumentRequestType {
	First = "kali-pertama",
	Expired = "tamat-tempoh",
	Full = "kehabisan-muka-surat",
	Damaged = "kerosakan",
	OutdatedPicturesDependents = "gambar-terbaru-kanak",
	Lost = "kehilangan",
}

// TODO: BE
export enum Gender {
	Female = "F",
	Male = "M",
}

// TODO: BE
export enum RelationshipStatus {
	Single = "belum-kahwin",
	Married = "kahwin",
	Widowed = "duda",
}
