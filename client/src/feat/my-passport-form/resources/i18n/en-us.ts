import type {
	AddressDetails,
	ApplicationDetails,
	DocumentType,
	PersonalDetails,
	RequestType,
} from "feat/my-passport-form/types";
import { Step } from "feat/my-passport-form/types/ui";

export const resources = {
	metaTitle: "Create a new application",
	doShowProgressMobile: "Show progress",
	doDelete: "Delete",
	doBack: "Back",
	doNext: "Next",
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
