import { toaster } from "@kobalte/core";
import { useQueryClient } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { invariant } from "es-toolkit";
import { queryKeys } from "feat/my-passport-form-sync/resources/query-keys";
import { SyncToast } from "feat/my-passport-form-sync/ui/sync-toast";
import { createReaction, createSignal } from "solid-js";

export const useToaster = () => {
	const userContext = useContext(UserContext);
	const authnContext = useContext(AuthnContext);

	const queryClient = useQueryClient();
	const mutationCache = queryClient.getMutationCache();

	const [toastId, setToastId] = createSignal(0);

	const track = createReaction(() => {
		if (!userContext().syncComplete || toastId()) {
			return;
		}

		const mutation = mutationCache.find<string[]>({
			mutationKey: queryKeys.putTransferApplications(
				authnContext().keycloak?.token,
			),
		});

		const numberOfApplications = mutation?.state.data?.length;
		invariant(numberOfApplications, "Number of applications is falsy");

		const id = toaster.show(props => (
			<SyncToast
				toastId={props.toastId}
				numberOfApplications={numberOfApplications}
			/>
		));

		setToastId(id);
	});

	track(() => userContext().syncComplete);

	return toastId;
};
