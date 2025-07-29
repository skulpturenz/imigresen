import { UserRouteTitle } from "core/constants/user-route.enum";
import { default as pluralize } from "pluralize";

export const resources = {
	metaTitle: UserRouteTitle.Profile,
	form: {
		errors: {
			email: "Must be an email",
			minChars: (minChars: number) =>
				`${minChars} ${pluralize("character", minChars)} minimum`,
			maxChars: (maxChars: number) =>
				`${maxChars} ${pluralize("character", maxChars)} maximum`,
			alphanumeric: "Must be alphanumeric",
		},
		userDetails: {
			email: {
				label: "Email",
			},
			firstName: {
				label: "First name",
			},
			lastName: {
				label: "Last name",
			},
		},
	},
	buttons: {
		cancel: "Cancel",
		submit: "Submit",
	},
};
