import type { AnyDocumentId } from "@automerge/automerge-repo";
import { useQuery } from "@tanstack/solid-query";
import { queryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
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
		const handles = await Promise.all(
			automergeUrls.data?.map(async ({ key, value }) => ({
				uuid: key,
				automergeUrl: value,
				handle: await repo.find(value as AnyDocumentId),
			})) ?? [],
		);

		return handles;
	};

	const passportApplications = useQuery(() => ({
		queryKey: queryKeys.getPassportApplications(
			authnContext().keycloak?.token,
		),
		queryFn: getPassportApplications,
		select: data =>
			data
				.sort((a, b) =>
					desc(UUID.parse(a.uuid).compareTo(UUID.parse(b.uuid))),
				)
				.map(application => ({
					uuid: application.uuid,
					automergeUrl: application.automergeUrl,
					...application.handle.doc(),
				})) as unknown as PassportApplication[],
		get enabled() {
			return Boolean(automergeUrls.data);
		},
	}));

	return {
		passportApplications,
	};
};

const desc = (sortOrder: number) => -1 * sortOrder;
