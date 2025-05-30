import { storageKeys } from "core/constants/storage-keys";
import { createStorage } from "unstorage";
import { default as localStorageDriver } from "unstorage/drivers/localstorage";
import { uuidv7 } from "uuidv7";

const storage = createStorage({
	driver: localStorageDriver({
		base: storageKeys.myPassportFormBase,
	}),
});

export const myPassportFormService = (token?: string) => {
	const registerApplication = async (automergeUrl: string) => {
		if (!token) {
			const uuid = uuidv7();

			storage.setItem(uuid, automergeUrl);

			return uuid;
		}

		// TODO
		const uuid = uuidv7();

		storage.setItem(uuid, automergeUrl);

		return uuid;
	};

	const deleteApplication = async (uuid: string) => {
		if (!token) {
			await storage.del(uuid);

			return;
		}

		// TODO
		await storage.del(uuid);
	};

	return {
		registerApplication,
		deleteApplication,
	};
};
