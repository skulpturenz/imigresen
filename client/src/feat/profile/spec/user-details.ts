import { object, string } from "yup";

export const userDetailsSchema = object({
	email: string().email(),
	firstName: string().min(1).max(60).matches(/^[a-zA-Z0-9]+$/, "First name must be alphanumeric"),
	lastName: string().min(1).max(60).matches(/^[a-zA-Z0-9]+$/, "Last name must be alphanumeric"),
});