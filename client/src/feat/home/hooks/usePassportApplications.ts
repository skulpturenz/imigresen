import type { AnyDocumentId } from "@automerge/automerge-repo";
import { useQuery } from "@tanstack/solid-query";
import { queryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { HomeContext } from "feat/home/context";
import type { PassportApplication } from "feat/home/types";
import { useRepo } from "solid-automerge";

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

		const passportApplications = handles.map(application => ({
			uuid: application.uuid,
			automergeUrl: application.automergeUrl,
			...application.handle.doc(),
		})) as unknown as PassportApplication[];

		return passportApplications;
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
