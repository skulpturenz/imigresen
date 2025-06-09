import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { selectMyPassportForm } from "common/epic/my-passport-form/select/selectMyPassportForm";
import { queryKeys as globalQueryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { invariant } from "es-toolkit";
import { MyPassportFormSyncContext } from "feat/my-passport-form-sync/context";
import { queryKeys } from "feat/my-passport-form-sync/resources/query-keys";
import { createSignal } from "solid-js";

export const useMyPassportFormSync = () => {
	const authnContext = useContext(AuthnContext);
	const userContext = useContext(UserContext);
	const myPassportFormSync = useContext(MyPassportFormSyncContext);
	const queryClient = useQueryClient();

	const [isOpen, setIsOpen] = createSignal(true);
	const toggleIsOpen = () => setIsOpen(isOpen => !isOpen);

	const [formRef, setFormRef] = createSignal<HTMLFormElement | null>(null);

	const qPublicApplications = useQuery(() => ({
		queryKey: queryKeys.getPublicApplications(
			authnContext().keycloak?.token,
		),
		queryFn: myPassportFormSync.getLocalPublicApplications,
		select: data =>
			data?.map(application => selectMyPassportForm(application)),
	}));

	const mTransferApplications = useMutation(() => ({
		mutationKey: queryKeys.putTransferApplications(
			authnContext().keycloak?.token,
		),
		mutationFn: myPassportFormSync.transferPublicApplications,
	}));

	const onClickImport = async () => {
		const form = formRef();
		invariant(form, "Form ref is not defined");

		const formData = new FormData(form);

		await mTransferApplications.mutateAsync({
			automergeUrls: Object.values(
				Object.fromEntries(formData),
			) as string[],
			sub: authnContext().keycloak?.tokenParsed?.sub,
		});

		await queryClient.refetchQueries({
			queryKey: globalQueryKeys.getPassportApplications(
				authnContext().keycloak?.token,
			),
		});

		userContext().actions.completeSync();
		toggleIsOpen();
	};

	const onClickCancel = () => {
		userContext().actions.completeSync();
		toggleIsOpen();
	};

	return {
		data: {
			publicApplications: () => qPublicApplications.data,
		},
		isOpen,
		toggleIsOpen,
		setFormRef,
		qPublicApplications,
		mTransferApplications,
		onClickCancel,
		onClickImport,
	};
};
