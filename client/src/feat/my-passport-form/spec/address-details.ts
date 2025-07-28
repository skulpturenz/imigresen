import { object, string } from "yup";

export const addressDetails = object({
	streetAddress: string(),
	postcode: string(),
	city: string(),
	state: string(),
	countryCode: string(),
});
