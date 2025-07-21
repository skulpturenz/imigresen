import { assertEnv } from "core/utils/assert-env";
import type {
	DeleteApplicationVariables,
	RegisterApplicationVariables,
} from "feat/my-passport-form/types";
import { default as wretch } from "wretch";

assertEnv(import.meta.env.VITE_API_BASE_URL, "API base url not specified");

const referenceDataApi = wretch(
	`${import.meta.env.VITE_API_BASE_URL}/reference-data/im42`,
);
const im42Api = wretch(`${import.meta.env.VITE_API_BASE_URL}/im42`);

export const myPassportFormService = (_token?: string) => {
	// TODO: register needs to take a param for `automergeUrl` and `sub`
	// also `sub` becomes user uuid (imi not kc)
	const registerApplication = async ({
		automergeUrl,
		sub,
	}: RegisterApplicationVariables) =>
		im42Api.post({ automergeUrl, sub }).text();

	// TODO: `sub` becomes user uuid (imi not kc)
	const deleteApplication = ({ uuid, sub }: DeleteApplicationVariables) =>
		im42Api.delete(`${sub}/${uuid}`);

	const getReferenceData = async () => {
		const countryOptions = await referenceDataApi
			.get("/countries")
			.json<[string, string][]>()
			.then(Object.fromEntries);
		const genderOptions = await referenceDataApi
			.get("/genders")
			.json<[string, string][]>()
			.then(Object.fromEntries);
		const relationshipStatusOptions = await referenceDataApi
			.get("/relationship-statuses")
			.json<[string, string][]>()
			.then(Object.fromEntries);
		const requestTypeOptions = await referenceDataApi
			.get("/request-types")
			.json<[string, string][]>()
			.then(Object.fromEntries);
		const documentTypeOptions = await referenceDataApi
			.get("/document-types")
			.json<[string, string][]>()
			.then(Object.fromEntries);

		return {
			genderOptions,
			relationshipStatusOptions,
			countryOptions,
			requestTypeOptions,
			documentTypeOptions,
		};
	};

	// TODO
	const getReferenceDataStates = async ({ queryKey: _queryKey }: any) => {
		return [] as string[];
	};

	return {
		registerApplication,
		deleteApplication,
		getReferenceData,
		getReferenceDataStates,
	};
};
