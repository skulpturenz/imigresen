import type {
	AddressDetails,
	ApplicationDetails,
	Declaration,
	DocumentType,
	PersonalDetails,
	PreviousDocuments,
	RequestType,
} from "feat/my-passport-form/types";
import { Step } from "feat/my-passport-form/types/ui";
import pluralize from "pluralize";

export const resources = {
	metaTitle: "Create a new application",
	doShowProgressMobile: "Show progress",
	doDelete: "Delete",
	doBack: "Back",
	doNext: "Next",
	doSubmit: "Submit",
	loading: "Loading...",
	steps: {
		[Step.PersonalDetails]: {
			label: `Step ${Step.PersonalDetails}`,
			description: "Personal details",
		},
		[Step.AddressDetails]: {
			label: `Step ${Step.AddressDetails}`,
			description: "Address details",
		},
		[Step.ApplicationDetails]: {
			label: `Step ${Step.ApplicationDetails}`,
			description: "Application details",
		},
		[Step.PreviousDocuments]: {
			label: `Step ${Step.PreviousDocuments}`,
			description: "Previous documents",
		},
		[Step.Declaration]: {
			label: `Step ${Step.Declaration}`,
			description: "Declaration",
		},
	},
	form: {
		errors: {
			email: "Must be an email",
			minChars: (minChars: number) =>
				`${minChars} ${pluralize("character", minChars)} minimum`,
			maxChars: (maxChars: number) =>
				`${maxChars} ${pluralize("character", maxChars)} maximum`,
			alphanumeric: "Must be alphanumeric",
			required: "Required",
		},
		optional: (label: string) => `${label} (Optional)`,
		personalDetails: {
			firstName: {
				label: "First name",
				placeholder: "",
			},
			lastName: {
				label: "Last name",
				placeholder: "",
			},
			nickName: {
				label: "Nick name",
				placeholder: "",
			},
			genderCode: {
				label: "Gender",
				placeholder: "",
			},
			dateOfBirth: {
				label: "Date of birth",
				placeholder: "DD/MM/YYYY",
				error: "Select your date of birth",
			},
			countryOfBirthCode: {
				label: "Country of birth",
				placeholder: "",
				description: "Autocorrected to a valid country",
			},
			stateOfBirth: {
				label: "State of birth",
				placeholder: "",
				info: "Required if you were born outside of Malaysia",
			},
			height: {
				label: "Height",
				placeholder: "",
				descriptionDefault: "Centimetres or metres",
				descriptionCentimetres: "Centimetres",
				descriptionMetres: "Metres",
			},
			emailAddress: {
				label: "Email address",
				placeholder: "",
			},
			mobileNumber: {
				label: "Mobile number",
				placeholder: "",
			},
			relationshipStatusCode: {
				label: "Relationship status",
				placeholder: "",
			},
		} satisfies Record<keyof PersonalDetails, any>,
		addressDetails: {
			streetAddress: {
				label: "Current street address",
				placeholder: "",
			},
			postcode: {
				label: "Postcode",
				placeholder: "",
			},
			city: {
				label: "City",
				placeholder: "",
			},
			state: {
				label: "State",
				placeholder: "",
			},
			countryCode: {
				label: "Country",
				placeholder: "",
				description: "Autocorrected to a valid country",
			},
		} satisfies Record<keyof AddressDetails, any>,
		applicationDetails: {
			documentType: {
				label: "Document type",
				placeholder: "",
			},
			requestType: {
				label: "Request type",
				placeholder: "",
			},
			myKadNumber: {
				label: "MyKad number",
				placeholder: "",
			},
			birthDocumentNumber: {
				label: "Birth document number",
				placeholder: "",
				description: [
					"Birth certificate number",
					"Adoption certificate number",
					"Borang W number",
				].join(" / "),
			},
		} satisfies Record<keyof ApplicationDetails, any>,
		previousDocuments: {
			previousDocumentNumber: {
				label: "Previous travel document number",
				placeholder: "",
				descriptionDisabled:
					"Only required if you have lost your passport or are requesting a new one for your children",
			},
			dependentCaregiverFirstName: {
				label: "Primary caregiver first name",
				placeholder: "",
				descriptionDisabled:
					"Only required if you are requesting a new one for your children",
			},
			dependentCaregiverLastName: {
				label: "Primary caregiver last name",
				placeholder: "",
				descriptionDisabled:
					"Only required if you are requesting a new one for your children",
			},
			dependentCaregiverMyKadNumber: {
				label: "Primary caregiver MyKad number",
				placeholder: "",
				descriptionDisabled:
					"Only required if you are requesting a new one for your children",
			},
			dependentCaregiverSignature: {
				label: "Primary caregiver signature",
				placeholder: "",
				descriptionEnabled: "Leave blank or sign",
				descriptionDisabled:
					"Only required if you are requesting a new one for your children",
			},
		} satisfies Record<keyof PreviousDocuments, any>,
		declaration: {
			confirmPreviousDocumentNumber: {
				label: (hasSpecified: boolean) => {
					if (hasSpecified) {
						return "Confirm previous travel document number";
					}

					return "Previous travel document number";
				},
				placeholder: "",
				description:
					"Previous travel document refers to your current travel document at the time of the application",
			},
			isDetailsCorrect: {
				label: (forDependents: boolean) => {
					if (forDependents) {
						return "I declare a request for a new passport / travel document to be issued for my child as per the provided details";
					}

					return "I declare a request for a new passport / travel document to be issued for myself as per the provided details";
				},
			},
			declareTrueAndCorrect: {
				label: [
					"I declare that all information provided is true and correct.",
					[
						"I understand that if incorrect information is provided then I may be liable",
						"to be fined a minimum of RM 10,000 up to a maximum of RM 50,000 or face imprisonment for a minimum of",
						"1 year up to a maximum of 5 years or both under the Passport Act of 1966 (renewed 1996)",
					].join(" "),
				],
			},
			isLiable: {
				label: [
					"I understand and agree that Imigresen and Skulpture have made best efforts to ensure a valid application",
					"but is not liable or responsible for any incorrect applications and it is solely my responsibility to ensure a true",
					"and correct application",
				].join(" "),
			},
		} satisfies Record<keyof Declaration, any>,
	},
	options: {
		documentTypes: {
			Pages64: "Malaysian passport (64 pages)",
			Pages32: "Malaysian passport (32 pages)",
			LimitedSingapore: "Limited Malaysian passport - Singapore",
			LimitedBrunei: "Limited Malaysian passport - Brunei",
			BorderPhilippines: "Malaysia - Philippines border passport", // TODO
			BorderIndonesia: "Malaysia - Indonesia border passport", // TODO
			Limited: "Limited travel document",
			EmergencyCertificate: "Emergency certificate",
		} satisfies Record<keyof typeof DocumentType, string>,
		requestTypes: {
			First: "First request",
			Expired: "Current passport expired",
			Full: "Current passport full", // TODO
			Damaged: "Damaged passport", // TODO
			OutdatedPicturesDependents: "Renew pictures (for children)", // TODO
			Lost: "Lost",
		} satisfies Record<keyof typeof RequestType, string>,
	},
};
