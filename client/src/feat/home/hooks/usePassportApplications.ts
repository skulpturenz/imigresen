import type { AnyDocumentId } from "@automerge/automerge-repo";
import { useQuery } from "@tanstack/solid-query";
import { queryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { delay } from "es-toolkit";
import { HomeContext } from "feat/home/context";
import type { PassportApplication } from "feat/home/types";
import { useRepo } from "solid-automerge";
import { UUID } from "uuidv7";

export const usePassportApplications = () => {
	const authnContext = useContext(AuthnContext);
	const homeContext = useContext(HomeContext);
	const repo = useRepo();

	const automergeUrls = useQuery(() => ({
		queryKey: queryKeys.getAutomergeUrls(authnContext().keycloak?.token),
		queryFn: homeContext.getAutomergeUrls,
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

	return {
		passportApplications,
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
