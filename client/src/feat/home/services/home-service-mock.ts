import type { AnyDocumentId, Repo } from "@automerge/automerge-repo";
import { selectMyPassportForm } from "common/epic/my-passport-form/select/select-my-passport-form";
import { storageKeys } from "core/constants/storage-keys";
import { flip, get, uuidAsc } from "core/data/sort";
import { flatten, invariant } from "es-toolkit";
import type {
	GetAutomergeUrlsVariables,
	GetPassportApplicationsVariables,
	ImportApplicationsVariables,
	MyPassportForm,
	RegisterApplicationVariables,
	RegisteredMyPassportForm,
} from "feat/home/types";
import { makeTimeout, readJson } from "feat/home/utils";
import { createStorage } from "unstorage";
import { default as localStorageDriver } from "unstorage/drivers/localstorage";
import { uuidv7 } from "uuidv7";

const storage = createStorage({
	driver: localStorageDriver({
		base: storageKeys.myPassportFormBase,
	}),
});

export const homeService = (repo: Repo, _token?: string) => {
	const getAutomergeUrls = async ({ sub }: GetAutomergeUrlsVariables) => {
		// TODO
		const localKeys = await storage.getKeys(
			storageKeys.myPassportFormApplications(sub),
		);
		const localItems = await storage.getItems<string>(localKeys);

		return localItems;
	};

	const getPassportApplications = async ({
		sub,
	}: GetPassportApplicationsVariables) => {
		const automergeUrls = await getAutomergeUrls({
			sub,
		});

		if (!automergeUrls.length) {
			return [];
		}

		const documents = await Promise.all(
			automergeUrls?.map(async ({ key, value }) => {
				const handle = await repo.find<
					Omit<RegisteredMyPassportForm, "uuid" | "automergeUrl">
				>(value as AnyDocumentId);

				// this usually happens if the doc does not exist on the remote or locally
				// either there's been a indexdb migration (database name change for example)
				// or the remote repo does not have the document
				await makeTimeout({
					message: `timed out waiting for automerge doc with url "${value}"`,
				})(handle.whenReady());

				const doc = selectMyPassportForm(handle.doc());

				return {
					uuid: key.split(":").at(-1) as string,
					automergeUrl: value,
					doc,
				};
			}) ?? [],
		);

		const getUuid = (document: (typeof documents)[number]) => document.uuid;

		return documents
			.sort(flip(get(getUuid)(uuidAsc)))
			.map<RegisteredMyPassportForm>(application => {
				return {
					uuid: application.uuid,
					automergeUrl: application.automergeUrl,
					...(application.doc as MyPassportForm),
				};
			});
	};

	const downloadApplications = async (automergeUrls: string[]) => {
		const docs = await Promise.all(
			automergeUrls.map(async automergeUrl => {
				try {
					const handle = await repo.find(
						automergeUrl as AnyDocumentId,
					);

					await handle.whenReady();

					return selectMyPassportForm(handle.doc());
				} catch {
					return null;
				}
			}),
		);

		const invalidUrls = docs.reduce<string[]>((acc, doc, idx) => {
			if (doc) {
				return acc;
			}

			const automergeUrl = automergeUrls.at(idx);
			invariant(
				automergeUrl,
				`No \`automergeUrl\` at index ${idx}, are docs filtered?`,
			);

			return [...acc, automergeUrl];
		}, []);

		return {
			docs: docs.filter(Boolean),
			invalidUrls,
		};
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

	const importApplications = async ({
		files,
		sub,
	}: ImportApplicationsVariables) => {
		const data = flatten(await Promise.all(files.map(readJson)), Infinity);

		const handles = await Promise.all(
			data.filter(Boolean).map(async data => {
				invariant(data, "data is undefined");
				invariant(data.version, "invalid passport form");

				const {
					// ignore any existing uuid and assign a new one
					uuid: _uuid,
					...doc
				} = data;

				const handle = repo.create(doc);

				await handle.whenReady();

				return handle;
			}),
		);

		const automergeUrls = handles.map(handle => handle.url);
		const uuids = await Promise.all(
			automergeUrls.map(automergeUrl =>
				registerApplication({
					automergeUrl,
					sub,
				}),
			),
		);

		return automergeUrls.reduce((acc, automergeUrl, idx) => {
			const uuid = uuids.at(idx);
			invariant(uuid, `No \`uuid\` at index ${idx}, are uuids filtered?`);

			return {
				...acc,
				[uuid]: automergeUrl,
			};
		}, Object.create(null));
	};

	return {
		getAutomergeUrls,
		getPassportApplications,
		downloadApplications,
		importApplications,
	};
};
