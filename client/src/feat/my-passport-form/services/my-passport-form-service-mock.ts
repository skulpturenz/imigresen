import { storageKeys } from "core/constants/storage-keys";
import { delay, invariant } from "es-toolkit";
import { default as referenceDataStateFixture } from "feat/my-passport-form/chore/reference-data-states.fixture";
import { default as referenceDataFixture } from "feat/my-passport-form/chore/reference-data.fixture";
import type {
	DeleteApplicationVariables,
	RegisterApplicationVariables,
} from "feat/my-passport-form/types";
import { createStorage } from "unstorage";
import { default as localStorageDriver } from "unstorage/drivers/localstorage";
import { uuidv7 } from "uuidv7";

const storage = createStorage({
	driver: localStorageDriver({
		base: storageKeys.myPassportFormBase,
	}),
});

export const myPassportFormService = (_token?: string) => {
	const registerApplication = async ({
		automergeUrl,
		sub,
	}: RegisterApplicationVariables) => {
		// TODO
		const uuid = uuidv7();

		storage.setItem(
			storageKeys.myPassportFormApplication(uuid, sub),
			automergeUrl,
		);

		return uuid;
	};

	const deleteApplication = async ({
		uuid,
		sub,
	}: DeleteApplicationVariables) => {
		// TODO
		await storage.del(storageKeys.myPassportFormApplication(uuid, sub));
	};

	const getReferenceData = async () => {
		await delay(250);

		return referenceDataFixture;
	};

	const getReferenceDataStates = async ({ queryKey }: any) => {
		invariant(
			queryKey && Array.isArray(queryKey),
			"Expected an array for query key",
		);

		const COUNTRY_IDX = -2;
		const country = queryKey.at(COUNTRY_IDX);

		if (!country) {
			return [];
		}

		await delay(250);

		return referenceDataStateFixture;
	};

	return {
		registerApplication,
		deleteApplication,
		getReferenceData,
		getReferenceDataStates,
	};
};
