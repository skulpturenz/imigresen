import type { AnyDocumentId } from "@automerge/automerge-repo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { queryKeys as globalQueryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { MyPassportFormSyncContext } from "feat/my-passport-form-sync/context";
import { queryKeys } from "feat/my-passport-form-sync/resources/query-keys";
import type { PassportApplication } from "feat/my-passport-form-sync/types";
import { useRepo } from "solid-automerge";

export const useMyPassportFormSync = () => {
	const authnContext = useContext(AuthnContext);
	const userContext = useContext(UserContext);
	const myPassportFormSync = useContext(MyPassportFormSyncContext);
	const queryClient = useQueryClient();
	const repo = useRepo();

	const qPublicApplications = useQuery(() => ({
		queryKey: queryKeys.getPublicApplications(
			authnContext().keycloak?.token,
		),
		queryFn: myPassportFormSync.getPublicApplications,
		select: async data => {
			const automergeUrls = data.map(({ value }) => value);

			const docs = await Promise.all(
				automergeUrls.map(async automergeUrl => {
					const handle = await repo.find<PassportApplication>(
						automergeUrl as AnyDocumentId,
					);

					await handle.whenReady();

					return handle.doc();
				}),
			);

			return docs;
		},
	}));

	const mTransferApplications = useMutation(() => ({
		mutationKey: queryKeys.putTransferApplications(
			authnContext().keycloak?.token,
		),
		mutationFn: myPassportFormSync.transferPublicApplications,
	}));

	const onClickTransferApplications = async (automergeUrls: string[]) => {
		await mTransferApplications.mutateAsync({
			automergeUrls,
			sub: authnContext().keycloak?.token,
		});

		await queryClient.refetchQueries({
			queryKey: globalQueryKeys.getPassportApplications(
				authnContext().keycloak?.token,
			),
		});

		userContext().actions.completeSync();
	};

	return {
		data: {
			publicApplications: () => qPublicApplications.data,
		},
		qPublicApplications,
		mTransferApplications,
		onClickTransferApplications,
	};
};
