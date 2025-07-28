import { UserRouteTitle } from "core/constants/user-route.enum";

export const resources = {
	metaTitle: UserRouteTitle.Profile,
	form: {
		userDetails: {
			email: {
				label: "Email",
			},
			firstName: {
				label: "First name",
				error: "First name must be alphanumeric",
			},
			lastName: {
				label: "Last name",
				error: "Last name must be alphanumeric",
			},
		},
	},
	buttons: {
		cancel: "Cancel",
		submit: "Submit",
	},
};
