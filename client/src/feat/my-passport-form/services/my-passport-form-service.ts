import { storageKeys } from "core/constants/storage-keys";
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

	// TODO
	const getReferenceData = async () => Object.create(null);

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
