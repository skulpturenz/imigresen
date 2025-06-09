import type { AnyDocumentId, Repo } from "@automerge/automerge-repo";
import { storageKeys } from "core/constants/storage-keys";
import { invariant } from "es-toolkit";
import type {
	DeleteApplicationVariables,
	PassportApplication,
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

export const myPassportFormSyncService = (repo: Repo, _token?: string) => {
	const getLocalPublicItems = async () => {
		const localKeys = await storage.getKeys(
			storageKeys.myPassportFormApplications(),
		);
		const localItems = await storage.getItems<string>(localKeys);

		return localItems;
	};

	const getLocalPublicApplications = async () => {
		const items = await getLocalPublicItems();

		const automergeUrls = items.map(({ value }) => value);

		const docs = await Promise.all(
			automergeUrls.map(async (automergeUrl, idx) => {
				const handle = await repo.find<PassportApplication>(
					automergeUrl as AnyDocumentId,
				);

				await handle.whenReady();

				const uuid = items.at(idx)?.key.split(":").at(-1);
				invariant(uuid, "invalid application");

				return {
					...handle.doc(),
					uuid,
					automergeUrl,
				};
			}),
		);

		return docs;
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
		const publicApplications = await getLocalPublicItems();

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
		getLocalPublicItems,
		getLocalPublicApplications,
		transferPublicApplications,
	};
};
