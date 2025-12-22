import {
	createConformer,
	transformDeep,
	type ConformerContext,
} from "core/data/transform-deep";
import { camelCase, isPlainObject } from "es-toolkit";
import {
	Step,
	type AddressDetails,
	type ApplicationDetails,
	type Declaration,
	type DropdownOptions,
	type MyPassportForm,
	type PersonalDetails,
	type PreviousDocuments,
} from "feat/my-passport-form/types";

export const toPutIm42Request = (
	automergeUrl: string,
	formValues: MyPassportForm,
	dropdownOptions: DropdownOptions,
) => {
	const isStep =
		<T = unknown>(step: Step) =>
		(x: unknown, context?: ConformerContext): x is T =>
			Boolean(isPlainObject(x) && context?.key === camelCase(Step[step]));

	const conformDate = createConformer(
		(value: Date) => value.toISOString(),
		value => value instanceof Date,
	);

	const conformRequestType = createConformer(
		(value: string) => dropdownOptions.requestTypeOptions[value],
		value =>
			typeof value === "string" &&
			new Set(Object.keys(dropdownOptions.requestTypeOptions)).has(value),
	);

	const conformDocumentTypes = createConformer(
		(value: string) => dropdownOptions.documentTypeOptions[value],
		value =>
			typeof value === "string" &&
			new Set(Object.keys(dropdownOptions.documentTypeOptions)).has(
				value,
			),
	);

	// TODO: api response needs to be the other way around
	// should be code to label instead of label to code as it is now
	const conformGenders = createConformer(
		(value: string) => dropdownOptions.genderOptions[value],
		value =>
			typeof value === "string" &&
			new Set(Object.keys(dropdownOptions.genderOptions)).has(value),
	);

	// TODO: api response needs to be the other way around
	// should be code to label instead of label to code as it is now
	const conformCountries = createConformer(
		(value: string) => dropdownOptions.countryOptions[value],
		value =>
			typeof value === "string" &&
			new Set(Object.keys(dropdownOptions.countryOptions)).has(value),
	);

	// TODO: api response needs to be the other way around
	// should be code to label instead of label to code as it is now
	const conformRelationshipStatus = createConformer(
		(value: string) => dropdownOptions.relationshipStatusOptions[value],
		value =>
			typeof value === "string" &&
			new Set(Object.keys(dropdownOptions.relationshipStatusOptions)).has(
				value,
			),
	);

	const conformPersonalDetails = createConformer(
		(value: PersonalDetails) => ({
			mobileNumber: value.mobileNumber,
			height: value.height,
			genderCode: value.genderCode,
			countryOfBirthCode: value.countryOfBirthCode,
			lastName: value.lastName,
			dateOfBirth: value.dateOfBirth,
			email: value.emailAddress,
			firstName: value.firstName,
			nickName: value.nickName,
			relationshipStatusCode: value.relationshipStatusCode,
		}),
		isStep<PersonalDetails>(Step.PersonalDetails),
	);

	const conformAddressDetails = createConformer(
		(value: AddressDetails) => ({
			streetAddress: value.streetAddress,
			countryCode: value.countryCode,
			postcode: value.postcode,
			state: value.state,
			city: value.city,
		}),
		isStep<AddressDetails>(Step.AddressDetails),
	);

	// TODO: forgot this section in the API
	const conformApplicationDetails = createConformer(
		(value: ApplicationDetails) => ({
			documentType: value.documentType,
			requestType: value.requestType,
			myKadNumber: value.myKadNumber,
			birthDocumentNumber: value.birthDocumentNumber,
		}),
		isStep<ApplicationDetails>(Step.ApplicationDetails),
	);

	const conformPreviousDocuments = createConformer(
		(value: PreviousDocuments) => ({
			previousTravelDocumentNumber: value.previousDocumentNumber,
			primaryCaregiverFirstName: value.dependentCaregiverFirstName,
			primaryCaregiverLastName: value.dependentCaregiverLastName,
			primaryCaregiverMykadNumber: value.dependentCaregiverMyKadNumber,
			primaryCaregiverSignature: value.dependentCaregiverSignature,
		}),
		isStep<PreviousDocuments>(Step.PreviousDocuments),
	);

	const conformDeclaration = createConformer(
		(value: Declaration) => ({
			previousTravelDocumentNumber: value.confirmPreviousDocumentNumber,
			isNewRequest: value.isDetailsCorrect,
			isInformationValid: value.declareTrueAndCorrect,
			isLiable: value.isLiable,
		}),
		isStep<Declaration>(Step.Declaration),
	);

	return {
		automergeUrl,
		...transformDeep<MyPassportForm, Record<string, any>>(formValues, [
			conformDate,
			conformPersonalDetails,
			conformAddressDetails,
			conformApplicationDetails,
			conformPreviousDocuments,
			conformDeclaration,
			conformRequestType,
			conformDocumentTypes,
			conformGenders,
			conformCountries,
			conformRelationshipStatus,
		]),
	};
};
