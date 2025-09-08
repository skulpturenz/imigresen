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
	type MyPassportForm,
	type PersonalDetails,
	type PreviousDocuments,
} from "feat/my-passport-form/types";

export const toPutIm42Request = (
	automergeUrl: string,
	formValues: MyPassportForm,
) => {
	const isStep =
		<T = unknown>(step: Step) =>
		(x: unknown, context?: ConformerContext): x is T =>
			Boolean(isPlainObject(x) && context?.key === camelCase(Step[step]));

	const conformDate = createConformer(
		(value: Date) => value.toISOString(),
		value => value instanceof Date,
	);

	// from: steps/personal-details
	const isMetres = (x: number) => {
		if (!x) {
			return false;
		}

		if (Math.floor(Number(x) / 10)) {
			return false;
		}

		return true;
	};
	const conformHeight = createConformer(
		(value: string) => {
			const x = Number(value);

			if (!isMetres(x)) {
				// cm to m
				return x / 100;
			}

			return x; // m otherwise
		},
		(value, context) =>
			context?.key === "height" && !Number.isNaN(Number(value)),
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
			conformHeight,
			conformPersonalDetails,
			conformAddressDetails,
			conformApplicationDetails,
			conformPreviousDocuments,
			conformDeclaration,
		]),
	};
};
