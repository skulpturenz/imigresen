import { object } from "yup";
import { userDetailsSchema } from "./user-details";

export const profileSchema = object({
	userDetails: userDetailsSchema,
});

export { userDetailsSchema };