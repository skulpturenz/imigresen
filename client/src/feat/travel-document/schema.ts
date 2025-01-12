import {
	isParentFieldEqual,
	toNullish,
	toRequired,
	whenOptions,
} from "core/data/yup/utils";
import { boolean, date, number, object, string } from "yup";

export interface TravelDocumentApplicationContext {
	isFinal?: boolean;
}

export const schema = object({
	documentType: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	requestType: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	isDependentRequest: boolean().default(false),
	fullName: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	otherName: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	identityCardNumber: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	birthCertificateNumber: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	dateOfBirth: date()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	gender: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	currentAddress: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	postcode: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	city: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	state: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	country: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	height: number() // meters
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	relatonshipStatus: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	mobileNumber: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	currentPassportNumber: string()
		.when(whenOptions(options => !options.context.isFinal, toNullish))
		.when(whenOptions(options => options.context.isFinal, toRequired)),
	isPersonalDetailsValid: boolean().default(false),
	isDependentPictureCurrent: boolean()
		.when(
			whenOptions(
				isParentFieldEqual("isDependentRequest", false),
				toNullish,
			),
		)
		.when(
			// when application made for dependents is required
			whenOptions(
				isParentFieldEqual("isDependentRequest", true),
				toRequired,
			),
		),
	isAllInformationValid: boolean().default(false),
	principalCaregiverFullName: string()
		.when(
			whenOptions(
				isParentFieldEqual("isDependentRequest", false),
				toNullish,
			),
		)
		.when(
			// when application made for dependents is required
			whenOptions(
				isParentFieldEqual("isDependentRequest", true),
				toRequired,
			),
		),
	principalCaregiverIdentityCardNumber: string()
		.when(
			whenOptions(
				isParentFieldEqual("isDependentRequest", false),
				toNullish,
			),
		)
		.when(
			// when application made for dependents is required
			whenOptions(
				isParentFieldEqual("isDependentRequest", true),
				toRequired,
			),
		),
	principalCaregiverSignature: string()
		.when(
			whenOptions(
				isParentFieldEqual("isDependentRequest", false),
				toNullish,
			),
		)
		.when(
			// when application made for dependents is required
			whenOptions(
				isParentFieldEqual("isDependentRequest", true),
				toRequired,
			),
		),
});
