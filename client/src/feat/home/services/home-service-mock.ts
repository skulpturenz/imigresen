import {
	randAnimalType,
	randFullName,
	randFutureDate,
	randStatus,
	randUuid,
	toCollection,
} from "@ngneat/falso";
import type { PassportApplication } from "../types";

export const homeService = (_token: string) => {
	const getPassportApplications = () =>
		toCollection(
			() => ({
				principalApplicant: randFullName(),
				applicationType: randAnimalType(),
				applicationUuid: randUuid(),
				submittedOn: randFutureDate(),
				status: randStatus(),
			}),
			{ length: 100 },
		) as PassportApplication[];

	return {
		getPassportApplications,
	};
};
