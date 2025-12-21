import { storageKeys } from "core/constants/storage-keys";
import { assertEnv } from "core/utils/assert-env";
import { toPutIm42Request } from "feat/my-passport-form/data/to-put-im42-request";
import type {
	DeleteApplicationVariables,
	GetAutomergeUrlVariables,
	PersistedMyPassportForm,
	PutApplicationVariables,
	RegisterApplicationVariables,
} from "feat/my-passport-form/types";
import { createStorage } from "unstorage";
import { default as localStorageDriver } from "unstorage/drivers/localstorage";
import { uuidv7 } from "uuidv7";
import { default as wretch } from "wretch";
import { default as QueryStringAddon } from "wretch/addons/queryString";

const storage = createStorage({
	driver: localStorageDriver({
		base: storageKeys.myPassportFormBase,
	}),
});

assertEnv(import.meta.env.VITE_API_BASE_URL, "API base url not specified");

const referenceDataApi = wretch(
	`${import.meta.env.VITE_API_BASE_URL}/reference-data/im42`,
);
const im42Api = wretch(`${import.meta.env.VITE_API_BASE_URL}/im42`).addon(
	QueryStringAddon,
);

export const myPassportFormService = (token?: string) => {
	const getAutomergeUrl = async ({
		uuid,
		user,
	}: GetAutomergeUrlVariables) => {
		if (!user) {
			const localItem = await storage.getItem<string>(
				storageKeys.myPassportFormApplication(uuid, user),
			);

			return localItem;
		}

		return im42Api
			.auth(`Bearer ${token}`)
			.query({ uuid: true }) // TODO: endpoint does not have this filter yet
			.get(`/user/${user}`)
			.json<Partial<PersistedMyPassportForm>[]>()
			.then(result => result.at(0)?.automergeUrl);
	};

	const registerApplication = async ({
		automergeUrl,
		user,
	}: RegisterApplicationVariables) => {
		if (!user) {
			const uuid = uuidv7();

			storage.setItem(
				storageKeys.myPassportFormApplication(uuid, user),
				automergeUrl,
			);

			return uuid;
		}

		return im42Api
			.auth(`Bearer ${token}`)
			.post({ automergeUrl, user }, `/user/${user}`)
			.text();
	};

	const deleteApplication = async ({
		uuid,
		user,
	}: DeleteApplicationVariables) => {
		if (!user) {
			await storage.del(
				storageKeys.myPassportFormApplication(uuid, user),
			);

			return;
		}

		await im42Api
			.auth(`Bearer ${token}`)
			.delete(`/${uuid}/user/${user}`)
			.res();
	};

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

	const putIm42 = async ({
		uuid,
		user,
		automergeUrl,
		formValues,
	}: PutApplicationVariables) => {
		await im42Api
			.auth(`Bearer ${token}`)
			.put(
				toPutIm42Request(automergeUrl, formValues),
				`/${uuid}/user/${user}`,
			)
			.res();
	};

	return {
		getAutomergeUrl,
		registerApplication,
		deleteApplication,
		getReferenceData,
		putIm42,
	};
};
