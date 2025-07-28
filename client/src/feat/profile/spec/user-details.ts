import { object, string } from "yup";

export const userDetailsSchema = object({
	email: string().email(),
	firstName: string().min(1).max(60),
	lastName: string().min(1).max(60),
});