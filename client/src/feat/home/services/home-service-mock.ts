import { randAlpha, toCollection } from "@ngneat/falso";
import type { PassportApplication } from "../types";

export const homeService = (_token?: string) => {
	const getPassportApplications = () =>
		toCollection(
			() => ({
				hello: randAlpha(),
			}),
			{ length: 100 },
		) as PassportApplication[];

	return {
		getPassportApplications,
	};
};
