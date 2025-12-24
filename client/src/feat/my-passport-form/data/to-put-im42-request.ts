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
		(value: PreviousDocuments) => {
			if (Object.values(value).every(x => !x)) {
				return null;
			}

			return {
				previousTravelDocumentNumber: value.previousDocumentNumber,
				primaryCaregiverFirstName: value.dependentCaregiverFirstName,
				primaryCaregiverLastName: value.dependentCaregiverLastName,
				primaryCaregiverMyKadNumber:
					value.dependentCaregiverMyKadNumber,
				primaryCaregiverSignature: value.dependentCaregiverSignature,
			};
		},
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
		]),
	};
};
