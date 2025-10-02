import type { AnyDocumentId, Repo } from "@automerge/automerge-repo";
import { selectMyPassportForm } from "common/epic/my-passport-form/select/select-my-passport-form";
import { storageKeys } from "core/constants/storage-keys";
import { flip, get, uuidAsc } from "core/data/sort";
import { delay, flatten, invariant } from "es-toolkit";
import { fixture as referenceDataFixture } from "feat/home/chore/reference-data.fixture";
import {
	MyPassportFormStatus,
	type GetAutomergeUrlsVariables,
	type GetPassportApplicationsVariables,
	type ImportApplicationsVariables,
	type PersistedMyPassportForm,
	type PromiseSettledResultValue,
	type RegisterApplicationVariables,
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
	const getAutomergeUrls = async ({ user }: GetAutomergeUrlsVariables) => {
		const localKeys = await storage.getKeys(
			storageKeys.myPassportFormApplications(user),
		);
		const localItems = await storage.getItems<string>(localKeys);

		return localItems.map<Partial<PersistedMyPassportForm>>(
			({ key, value }) => ({
				uuid: key.split(":").at(-1),
				automergeUrl: value,
				status: MyPassportFormStatus.Draft,
			}),
		);
	};

	const getPassportApplications = async ({
		user,
	}: GetPassportApplicationsVariables) => {
		const automergeUrls = await getAutomergeUrls({
			user,
		});

		// TODO: update types
		const getUuid = (document: Record<string, any>) =>
			document.uuid as string;

		if (!automergeUrls.length) {
			return [];
		}

		const draftDocuments = await Promise.allSettled(
			automergeUrls?.map(async form => {
				const handle = await repo.find<
					Omit<PersistedMyPassportForm, "uuid" | "automergeUrl">
				>(form.automergeUrl as AnyDocumentId);

				// this usually happens if the doc does not exist on the remote or locally
				// either there's been a indexdb migration (database name change for example)
				// or the remote repo does not have the document
				await makeTimeout({
					message: `timed out waiting for automerge doc with url "${form.automergeUrl}"`,
				})(handle.whenReady());

				const doc = selectMyPassportForm(handle.doc());

				return {
					uuid: form.uuid,
					automergeUrl: form.automergeUrl,
					doc,
				};
			}) ?? [],
		).then(promiseSettledResults =>
			promiseSettledResults.reduce<
				PromiseSettledResultValue<
					(typeof promiseSettledResults)[number]
				>[]
			>((acc, promise) => {
				const isPromiseRejected = (
					x: unknown,
				): x is PromiseRejectedResult =>
					(x as PromiseRejectedResult)?.status === "rejected";

				// in prod we want to throw if any application fails to load
				invariant(
					!import.meta.env.PROD || !isPromiseRejected(promise),
					(promise as PromiseRejectedResult).reason,
				);

				// in dev sometimes when using the same account locally with deployed apis
				// the document won't load if it was created to the deployed automerge repo
				// can't authenticate to deployed automerge repo because the authentication
				// will fail since cookie auth
				// likewise any local applications won't load in dev environments
				const filterOrphanedApplications =
					import.meta.env.DEV && isPromiseRejected(promise);

				if (filterOrphanedApplications) {
					invariant(
						!import.meta.env.PROD,
						"Filtering orphaned records in production",
					);

					return acc;
				}

				const { value: result } = promise as PromiseFulfilledResult<
					PromiseSettledResultValue<typeof promise>
				>;

				return [...acc, result];
			}, []),
		);

		const allDocuments = [
			...draftDocuments.map<PersistedMyPassportForm>(application => {
				return {
					...(application.doc as PersistedMyPassportForm),
					uuid: application.uuid as string,
					automergeUrl: application.automergeUrl as string,
				};
			}),
		];

		return allDocuments.sort(flip(get(getUuid)(uuidAsc)));
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
		user,
	}: RegisterApplicationVariables) => {
		const uuid = uuidv7();

		storage.setItem(
			storageKeys.myPassportFormApplication(uuid, user),
			automergeUrl,
		);

		return uuid;
	};

	const importApplications = async ({
		files,
		user,
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
					user,
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

	const getReferenceData = async () => {
		await delay(250);

		return referenceDataFixture;
	};

	return {
		getAutomergeUrls,
		getPassportApplications,
		downloadApplications,
		importApplications,
		getReferenceData,
	};
};
