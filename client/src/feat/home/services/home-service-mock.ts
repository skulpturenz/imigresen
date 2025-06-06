import { storageKeys } from "core/constants/storage-keys";
import { createStorage } from "unstorage";
import { default as localStorageDriver } from "unstorage/drivers/localstorage";

const storage = createStorage({
	driver: localStorageDriver({
		base: storageKeys.myPassportFormBase,
	}),
});

export const homeService = (_token?: string) => {
	const getAutomergeUrls = async () => {
		const localKeys = await storage.getKeys();
		const localItems = await storage.getItems<string>(localKeys);

		return localItems;
	};

	const registerApplication = async (automergeUrl: string) => {
		const uuid = crypto.randomUUID();

		storage.setItem(uuid, automergeUrl);

		return uuid;
	};

	return {
		getAutomergeUrls,
		registerApplication,
	};
};
