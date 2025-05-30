import type { PersonalDetails } from "feat/my-passport-form/types";
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
			},
			stateOfBirth: {
				label: "State of birth",
				placeholder: "",
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
	},
};
