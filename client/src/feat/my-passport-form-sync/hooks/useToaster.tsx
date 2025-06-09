import { toaster } from "@kobalte/core";
import { useQueryClient } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { useI18n } from "core/context/i18n";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { invariant } from "es-toolkit";
import type { resources } from "feat/my-passport-form-sync/resources/i18n/en-US";
import { queryKeys } from "feat/my-passport-form-sync/resources/query-keys";
import {
	createReaction,
	createSignal,
	type Component,
	type ParentProps,
} from "solid-js";
import { Toast, ToastContent, ToastDescription, ToastTitle } from "ui/toast";
import { withI18n } from "../resources";

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
			<>
				<MyPassportFormSyncToast
					toastId={props.toastId}
					numberOfApplications={numberOfApplications}
				/>
			</>
		));

		setToastId(id);
	});

	track(() => userContext().syncComplete);

	return toastId;
};

interface MyPassportFormSyncToastProps {
	toastId: number;
	numberOfApplications: number;
}

const MyPassportFormSyncToast: Component<
	ParentProps<MyPassportFormSyncToastProps>
> = withI18n(props => {
	const t = useI18n<typeof resources>();

	return (
		<Toast toastId={props.toastId}>
			<ToastContent>
				<ToastTitle>{t("toastTitle")}</ToastTitle>

				<ToastDescription>
					{t("toastDescription", props.numberOfApplications)}
				</ToastDescription>
			</ToastContent>
		</Toast>
	);
});
