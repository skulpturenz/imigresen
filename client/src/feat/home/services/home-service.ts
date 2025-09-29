import type { AnyDocumentId, Repo } from "@automerge/automerge-repo";
import { selectMyPassportForm } from "common/epic/my-passport-form/select/select-my-passport-form";
import { MyPassportFormStatus } from "common/epic/my-passport-form/types";
import { storageKeys } from "core/constants/storage-keys";
import { flip, get, uuidAsc } from "core/data/sort";
import { assertEnv } from "core/utils/assert-env";
import { flatten, invariant } from "es-toolkit";
import type {
	GetAutomergeUrlsVariables,
	GetPassportApplicationsVariables,
	ImportApplicationsVariables,
	PromiseSettledResultValue,
	RegisterApplicationVariables,
	RegisteredMyPassportForm,
} from "feat/home/types";
import { makeTimeout, readJson } from "feat/home/utils";
import { createStorage } from "unstorage";
import { default as localStorageDriver } from "unstorage/drivers/localstorage";
import { default as wretch } from "wretch";
import { default as QueryStringAddon } from "wretch/addons/queryString";

const storage = createStorage({
	driver: localStorageDriver({
		base: storageKeys.myPassportFormBase,
	}),
});

assertEnv(import.meta.env.VITE_API_BASE_URL, "API base url not specified");
const im42Api = wretch(`${import.meta.env.VITE_API_BASE_URL}/im42`).addon(
	QueryStringAddon,
);
const referenceDataApi = wretch(
	`${import.meta.env.VITE_API_BASE_URL}/reference-data/im42`,
);

export const homeService = (repo: Repo, token?: string) => {
	const getAutomergeUrls = async ({ user }: GetAutomergeUrlsVariables) => {
		if (!user) {
			const localKeys = await storage.getKeys(
				storageKeys.myPassportFormApplications(user),
			);
			const localItems = await storage.getItems<string>(localKeys);

			return localItems.map<Partial<RegisteredMyPassportForm>>(
				({ key, value }) => ({
					uuid: key.split(":").at(-1),
					automergeUrl: value,
					status: MyPassportFormStatus.Draft,
				}),
			);
		}

		return im42Api
			.auth(`Bearer ${token}`)
			.query({ draft: true })
			.get(`/user/${user}`)
			.json<Partial<RegisteredMyPassportForm>[]>();
	};

	const getPassportApplications = async ({
		user,
	}: GetPassportApplicationsVariables) => {
		const automergeUrls = await getAutomergeUrls({
			user,
		});

		const nonDraftDocuments = [];
		if (user) {
			const documents = await im42Api
				.auth(`Bearer ${token}`)
				.query({ draft: false })
				.get(`/user/${user}`)
				.json<RegisteredMyPassportForm[]>();

			nonDraftDocuments.push(...documents);
		}

		// TODO: update types
		const getUuid = (document: Record<string, any>) =>
			document.uuid as string;

		if (!automergeUrls.length) {
			return nonDraftDocuments.sort(flip(get(getUuid)(uuidAsc)));
		}

		const draftDocuments = await Promise.allSettled(
			automergeUrls?.map(async form => {
				const handle = await repo.find<
					Omit<RegisteredMyPassportForm, "uuid" | "automergeUrl">
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
			...draftDocuments.map<RegisteredMyPassportForm>(application => {
				return {
					...(application.doc as RegisteredMyPassportForm),
					uuid: application.uuid as string,
					automergeUrl: application.automergeUrl as string,
				};
			}),
			...nonDraftDocuments,
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

	const registerApplication = async ({
		automergeUrl,
		user,
	}: RegisterApplicationVariables) =>
		im42Api
			.auth(`Bearer ${token}`)
			.post({ automergeUrl, user }, `/user/${user}`)
			.text();

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
		const countryOptions = await referenceDataApi
			.get("/countries")
			.json<[string, string][]>()
			.then(Object.fromEntries);
		const genderOptions = await referenceDataApi
			.get("/genders")
			.json<[string, string][]>()
			.then(Object.fromEntries);
		const relationshipStatusOptions = await referenceDataApi
			.get("/relationship-statuses")
			.json<[string, string][]>()
			.then(Object.fromEntries);
		const requestTypeOptions = await referenceDataApi
			.get("/request-types")
			.json<[string, string][]>()
			.then(Object.fromEntries);
		const documentTypeOptions = await referenceDataApi
			.get("/document-types")
			.json<[string, string][]>()
			.then(Object.fromEntries);

		return {
			genderOptions,
			relationshipStatusOptions,
			countryOptions,
			personalDetailsStateOptions: [] as string[], // TODO
			addressDetailsStateOptions: [] as string[], // TODO
			requestTypeOptions,
			documentTypeOptions,
		};
	};

	return {
		getAutomergeUrls,
		getPassportApplications,
		downloadApplications,
		importApplications,
		getReferenceData,
	};
};
