import { resources } from "feat/profile/resources/i18n/en-us";
import { object, string } from "yup";
import { constants } from "./constants";

export const userDetailsSchema = object({
	email: string().email(resources.form.errors.email),
	firstName: string()
		.min(
			constants.fieldConstraints.nameMinChars,
			resources.form.errors.minChars(
				constants.fieldConstraints.nameMinChars,
			),
		)
		.max(
			constants.fieldConstraints.nameMaxChars,
			resources.form.errors.maxChars(
				constants.fieldConstraints.nameMaxChars,
			),
		)
		.matches(
			constants.regex.alphanumeric,
			resources.form.errors.alphanumeric,
		),
	lastName: string()
		.min(
			constants.fieldConstraints.nameMinChars,
			resources.form.errors.minChars(
				constants.fieldConstraints.nameMinChars,
			),
		)
		.max(
			constants.fieldConstraints.nameMaxChars,
			resources.form.errors.maxChars(
				constants.fieldConstraints.nameMaxChars,
			),
		)
		.matches(
			constants.regex.alphanumeric,
			resources.form.errors.alphanumeric,
		),
});
