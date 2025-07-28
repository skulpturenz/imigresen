import { object, string } from "yup";
import { constants } from "./constants";
import { resources } from "feat/profile/resources/i18n/en-us";

export const userDetailsSchema = object({
	email: string().email(),
	firstName: string().min(1).max(60).matches(constants.regex.alphanumeric, resources.form.firstName.error),
	lastName: string().min(1).max(60).matches(constants.regex.alphanumeric, resources.form.lastName.error),
});