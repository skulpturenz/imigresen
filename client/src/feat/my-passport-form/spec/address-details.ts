import { toRequired, whenOptions } from "core/data/yup/utils";
import { object, string } from "yup";
import { isPublished } from "./utils";

export const addressDetails = object({
	streetAddress: string().when(whenOptions(isPublished, toRequired)),
	postcode: string().when(whenOptions(isPublished, toRequired)),
	city: string().when(whenOptions(isPublished, toRequired)),
	state: string().when(whenOptions(isPublished, toRequired)),
	countryCode: string().when(whenOptions(isPublished, toRequired)),
});
