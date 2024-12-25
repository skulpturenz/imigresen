import type { PassportApplication } from "feat/home/types";

export const homeService = (_token?: string) => {
	const getPassportApplications = () => [] as PassportApplication[];

	return {
		getPassportApplications,
	};
};
