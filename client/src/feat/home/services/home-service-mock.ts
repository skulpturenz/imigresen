import type { PassportApplication } from "../types";

export const homeService = (_token?: string) => {
	const getPassportApplications = () => [] as PassportApplication[];

	return {
		getPassportApplications,
	};
};
