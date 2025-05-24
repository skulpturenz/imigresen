import { storageKeys } from "core/constants/storage-keys";
import { createStorage } from "unstorage";
import { default as localStorageDriver } from "unstorage/drivers/localstorage";

const storage = createStorage({
	driver: localStorageDriver({
		base: storageKeys.myPassportFormBase,
	}),
});

export const homeService = (token?: string) => {
	const getPassportApplications = async () => {
		if (!token) {
			const localKeys = await storage.getKeys();
			const localItems = await storage.getItems<string>(localKeys);

			return localItems;
		}

		throw new Error("TODO");
	};

	return {
		getPassportApplications,
	};
};
