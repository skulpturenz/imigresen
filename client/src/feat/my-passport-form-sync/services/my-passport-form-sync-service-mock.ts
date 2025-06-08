import { storageKeys } from "core/constants/storage-keys";
import { invariant } from "es-toolkit";
import type {
	DeleteApplicationVariables,
	RegisterApplicationVariables,
	TransferPublicApplicationsVariables,
} from "feat/my-passport-form-sync/types";
import { createStorage } from "unstorage";
import { default as localStorageDriver } from "unstorage/drivers/localstorage";
import { uuidv7 } from "uuidv7";

const storage = createStorage({
	driver: localStorageDriver({
		base: storageKeys.myPassportFormBase,
	}),
});

export const myPassportFormSyncServiceMock = (_token?: string) => {
	const getPublicApplications = async () => {
		const localKeys = await storage.getKeys(
			storageKeys.myPassportFormApplications(),
		);
		const localItems = await storage.getItems<string>(localKeys);

		return localItems;
	};

	// same as `registerApplications` in `myPassportFormService`
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

	// same as `deleteApplication` in `myPassportFormService`
	const deleteApplication = async ({
		uuid,
		sub,
	}: DeleteApplicationVariables) => {
		// TODO
		await storage.del(storageKeys.myPassportFormApplication(uuid, sub));
	};

	const transferPublicApplications = async ({
		automergeUrls,
		sub,
	}: TransferPublicApplicationsVariables) => {
		const publicApplications = await getPublicApplications();

		const selectedApplications = publicApplications.filter(
			({ value: publicApplicationUrl }) =>
				automergeUrls.includes(publicApplicationUrl),
		);

		invariant(
			automergeUrls.length === selectedApplications.length,
			"Attempt to transfer Automerge URL which is not public",
		);

		const selectedApplicationsUuid = selectedApplications.map(
			({ key }) => key.split(":").at(-1) as string,
		);

		await Promise.all(
			selectedApplicationsUuid.map(uuid => deleteApplication({ uuid })),
		);

		const selectedApplicationsAutomergeUrls = selectedApplications.map(
			({ value }) => value,
		);

		const selectedApplicationsNewUuids = await Promise.all(
			selectedApplicationsAutomergeUrls.map(automergeUrl =>
				registerApplication({ automergeUrl, sub }),
			),
		);

		return selectedApplicationsNewUuids;
	};

	return {
		getPublicApplications,
		transferPublicApplications,
	};
};
