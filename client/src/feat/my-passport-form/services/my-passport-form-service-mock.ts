import { storageKeys } from "core/constants/storage-keys";
import { createStorage } from "unstorage";
import { default as localStorageDriver } from "unstorage/drivers/localstorage";

const storage = createStorage({
	driver: localStorageDriver({
		base: storageKeys.myPassportFormBase,
	}),
});

export const myPassportFormService = (_token?: string) => {
	const registerApplication = async (automergeUrl: string) => {
		const uuid = crypto.randomUUID();

		storage.setItem(uuid, automergeUrl);

		return uuid;
	};

	const deleteApplication = async (uuid: string) => {
		storage.del(uuid);
	};

	return {
		registerApplication,
		deleteApplication,
	};
};
