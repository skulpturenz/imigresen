import { resources } from "feat/profile/resources/i18n/en-us";
import { object, string } from "yup";
import { constants } from "./constants";

export const userDetailsSchema = object({
	email: string().email(),
	firstName: string()
		.min(constants.fieldConstraints.nameMinChars)
		.max(constants.fieldConstraints.nameMaxChars)
		.matches(
			constants.regex.alphanumeric,
			resources.form.userDetails.firstName.error,
		),
	lastName: string()
		.min(constants.fieldConstraints.nameMinChars)
		.max(constants.fieldConstraints.nameMaxChars)
		.matches(
			constants.regex.alphanumeric,
			resources.form.userDetails.lastName.error,
		),
});
