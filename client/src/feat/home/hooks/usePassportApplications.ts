import type { AnyDocumentId } from "@automerge/automerge-repo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import {
	queryKeys as globalQueryKeys,
	queryKeys,
} from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { delay, invariant } from "es-toolkit";
import { HomeContext } from "feat/home/context";
import type { PassportApplication } from "feat/home/types";
import { exportData } from "feat/home/utils/export-data";
import { readJson } from "feat/home/utils/read-json";
import { useRepo } from "solid-automerge";
import { UUID } from "uuidv7";

export const usePassportApplications = () => {
	const authnContext = useContext(AuthnContext);
	const homeContext = useContext(HomeContext);
	const repo = useRepo();
	const queryClient = useQueryClient();

	const automergeUrls = useQuery(() => ({
		queryKey: queryKeys.getAutomergeUrls(authnContext().keycloak?.token),
		queryFn: homeContext.getAutomergeUrls,
	}));

	// TODO: sort
	const downloadApplications = useMutation(() => ({
		mutationKey: queryKeys.downloadPassportApplications(
			authnContext().keycloak?.token,
		),
		mutationFn: async (automergeUrls: string[]) => {
			const docs = await Promise.all(
				automergeUrls.map(async automergeUrl => {
					try {
						const handle = await repo.find(
							automergeUrl as AnyDocumentId,
						);

						await handle.whenReady();

						return handle.doc();
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
		},
	}));

	const importApplications = useMutation(() => ({
		mutationKey: queryKeys.importPassportApplications(
			authnContext().keycloak?.token,
		),
		mutationFn: async (files: File[]) => {
			// TODO: sort
			const parsedFiles: any[] = await Promise.all(
				files.map(file => readJson(file)), // TODO: types
			);

			const data: any[] = parsedFiles.reduce(
				// TODO
				(acc, parsed) => [...parsed, ...acc],
				[],
			);

			const handles = await Promise.all(
				data.map(async doc => {
					const handle = repo.create(doc);

					await handle.whenReady();

					return handle;
				}),
			);

			const automergeUrls = handles.map(handle => handle.url);
			const uuids = automergeUrls.map(automergeUrl =>
				homeContext.registerApplication(automergeUrl),
			);

			const existingAutomergeUrls =
				queryClient.getQueryData<string[]>(
					globalQueryKeys.getAutomergeUrls(
						authnContext().keycloak?.token,
					),
				) ?? [];

			const updatedAutomergeUrls = [
				...automergeUrls,
				...existingAutomergeUrls,
			];

			queryClient.setQueryData(
				globalQueryKeys.getAutomergeUrls(
					authnContext().keycloak?.token,
				),
				updatedAutomergeUrls,
			);

			const existingApplications =
				queryClient.getQueryData<PassportApplication[]>(
					globalQueryKeys.getPassportApplications(
						authnContext().keycloak?.token,
					),
				) ?? [];

			const updatedApplications = [
				...data.reduce<any[]>((acc, doc, idx) => {
					const automergeUrl = automergeUrls.at(idx);
					const uuid = uuids.at(idx);

					invariant(
						automergeUrl,
						`Automerge url not specified for document at index ${idx}`,
					);
					invariant(
						uuid,
						`Document at index ${idx} is not registered`,
					);

					return [
						{
							uuid,
							automergeUrl,
							...doc,
						},
						...acc,
					];
				}, []),
				...existingApplications,
			];

			queryClient.setQueryData(
				globalQueryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
				updatedApplications,
			);
		},
	}));

	const getPassportApplications = async () => {
		const documents = await Promise.all(
			automergeUrls.data?.map(async ({ key, value }) => {
				const handle = await repo.find<
					Omit<PassportApplication, "uuid" | "automergeUrl">
				>(value as AnyDocumentId);

				// this usually happens if the doc does not exist on the remote or locally
				// either there's been a indexdb migration (database name change for example)
				// or the remote repo does not have the document
				await makeTimeout({
					message: `timed out waiting for automerge doc with url "${value}"`,
				})(handle.whenReady());

				const doc = handle.doc();

				return {
					uuid: key,
					automergeUrl: value,
					doc,
				};
			}) ?? [],
		);

		return documents
			.sort((a, b) =>
				desc(UUID.parse(a.uuid).compareTo(UUID.parse(b.uuid))),
			)
			.map<PassportApplication>(application => {
				return {
					uuid: application.uuid,
					automergeUrl: application.automergeUrl,
					...application.doc,
				};
			});
	};

	const passportApplications = useQuery(() => ({
		queryKey: queryKeys.getPassportApplications(
			authnContext().keycloak?.token,
		),
		queryFn: getPassportApplications,
		get enabled() {
			return Boolean(automergeUrls.data);
		},
	}));

	const onClickExportApplications = async () => {
		if (!automergeUrls.data?.length) {
			return;
		}

		const { docs } = await downloadApplications.mutateAsync(
			automergeUrls.data?.map(automergeDoc => automergeDoc.value) ?? [],
		);

		const data = JSON.stringify(docs, null, 2);

		const fileName = [
			"passport",
			"applications",
			authnContext().keycloak?.profile?.email,
		]
			.filter(Boolean)
			.join("-");

		exportData(fileName, "application/json", data);

		downloadApplications.reset();
	};

	/// @ts-expect-error: TODO
	const onClickImportApplications = async () => {};

	return {
		automergeUrls,
		passportApplications,
		downloadApplications,
		onClickExportApplications,
		importApplications,
	};
};

const desc = (sortOrder: number) => -1 * sortOrder;

const makeTimeout =
	({ timeoutMs = 500, message = "" }) =>
	(promise: Promise<any>) =>
		Promise.race([
			promise,
			new Promise((_, reject) =>
				delay(timeoutMs).then(() =>
					reject(
						new Error(message || `timed out after ${timeoutMs} ms`),
					),
				),
			),
		]);
