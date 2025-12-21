import { storageKeys } from "core/constants/storage-keys";
import { delay } from "es-toolkit";
import { fixture as referenceDataFixture } from "feat/my-passport-form/chore/reference-data.fixture";
import type {
	DeleteApplicationVariables,
	PutApplicationVariables,
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
		user,
	}: RegisterApplicationVariables) => {
		const uuid = uuidv7();

		storage.setItem(
			storageKeys.myPassportFormApplication(uuid, user),
			automergeUrl,
		);

		return uuid;
	};

	const deleteApplication = async ({
		uuid,
		user,
	}: DeleteApplicationVariables) => {
		await storage.del(storageKeys.myPassportFormApplication(uuid, user));
	};

	const getReferenceData = async () => {
		await delay(250);

		return referenceDataFixture;
	};

	const putIm42 = async (_variables: PutApplicationVariables) => {
		await delay(250);
	};

	return {
		registerApplication,
		deleteApplication,
		getReferenceData,
		putIm42,
	};
};
