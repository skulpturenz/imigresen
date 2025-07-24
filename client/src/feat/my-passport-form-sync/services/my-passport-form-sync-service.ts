import type { AnyDocumentId, Repo } from "@automerge/automerge-repo";
import { storageKeys } from "core/constants/storage-keys";
import { invariant } from "es-toolkit";
import type {
	DeleteApplicationVariables,
	RegisterApplicationVariables,
	RegisteredMyPassportForm,
	TransferPublicApplicationsVariables,
} from "feat/my-passport-form-sync/types";
import { createStorage } from "unstorage";
import { default as localStorageDriver } from "unstorage/drivers/localstorage";
import { default as wretch } from "wretch";

const storage = createStorage({
	driver: localStorageDriver({
		base: storageKeys.myPassportFormBase,
	}),
});

const im42Api = wretch(`${import.meta.env.VITE_API_BASE_URL}/im42`);

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
				const handle = await repo.find<RegisteredMyPassportForm>(
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
		user,
	}: RegisterApplicationVariables) =>
		im42Api.post({ automergeUrl, user }).text();

	// same as `deleteApplication` in `myPassportFormService`
	const deleteApplication = async ({
		uuid,
		user,
	}: DeleteApplicationVariables) => {
		await im42Api.delete(`${user}/${uuid}`).res();
	};

	const transferPublicApplications = async ({
		automergeUrls,
		user,
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
				registerApplication({ automergeUrl, user }),
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
