import { toRequired, whenOptions } from "core/data/yup/utils";
import { object, string } from "yup";
import { isPublished } from "./utils";

export const personalDetails = object({
	firstName: string().when(whenOptions(isPublished, toRequired)),
	lastName: string().when(whenOptions(isPublished, toRequired)),
	nickName: string().when(whenOptions(isPublished, toRequired)),
	genderCode: string().when(whenOptions(isPublished, toRequired)),
	dateOfBirth: string().when(whenOptions(isPublished, toRequired)),
	countryOfBirthCode: string().when(whenOptions(isPublished, toRequired)),
	stateOfBirth: string().when(whenOptions(isPublished, toRequired)),
	height: string().when(whenOptions(isPublished, toRequired)),
	emailAddress: string().when(whenOptions(isPublished, toRequired)),
	mobileNumber: string().when(whenOptions(isPublished, toRequired)),
	relationshipStatusCode: string().when(whenOptions(isPublished, toRequired)),
});
