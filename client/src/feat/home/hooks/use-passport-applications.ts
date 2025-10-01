import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { queryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { HomeContext } from "feat/home/context";
import { MyPassportFormStatus } from "feat/home/types";
import { exportData } from "feat/home/utils";
import { createSignal } from "solid-js";

export const usePassportApplications = () => {
	const authnContext = useContext(AuthnContext);
	const userContext = useContext(UserContext);
	const homeContext = useContext(HomeContext);
	const queryClient = useQueryClient();

	const [show, setShow] = createSignal({
		importDialog: false,
		failedToExportDialog: false,
	});
	const toggleImportDialog = () =>
		setShow(show => ({ ...show, importDialog: !show.importDialog }));
	const toggleFailedToExportDialog = () =>
		setShow(show => ({
			...show,
			failedToExportDialog: !show.failedToExportDialog,
		}));

	const mDownloadApplications = useMutation(() => ({
		mutationKey: queryKeys.downloadPassportApplications(
			authnContext().keycloak?.token,
		),
		mutationFn: homeContext.downloadApplications,
	}));

	const mImportApplications = useMutation(() => ({
		mutationKey: queryKeys.importPassportApplications(
			authnContext().keycloak?.token,
		),
		mutationFn: homeContext.importApplications,
	}));

	const qPassportApplications = useQuery(() => ({
		queryKey: queryKeys.getPassportApplications(
			authnContext().keycloak?.token,
		),
		queryFn: () =>
			homeContext.getPassportApplications({
				user: userContext().profile?.uuid,
			}),
	}));

	const onClickExportApplications = async () => {
		if (!qPassportApplications.data?.length) {
			return;
		}

		const { docs, invalidUrls } = await mDownloadApplications.mutateAsync(
			qPassportApplications.data?.map(
				passportApplication => passportApplication.automergeUrl,
			) ?? [],
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

		if (invalidUrls.length) {
			toggleFailedToExportDialog();
		}
	};

	const onClickCloseExportApplications = async () => {
		mDownloadApplications.reset();
		toggleFailedToExportDialog();
	};

	const onClickImportApplications = async (files: File[]) => {
		mImportApplications.reset();

		await mImportApplications.mutateAsync({
			files,
			user: userContext().profile?.uuid,
		});

		qPassportApplications.refetch();

		toggleImportDialog();
	};

	const prefetchReferenceData = () => {
		queryClient.prefetchQuery({
			queryKey: queryKeys.getReferenceData(
				authnContext().keycloak?.token,
			),
			queryFn: homeContext.getReferenceData,
			staleTime: Infinity,
		});
	};

	const getCurrentApplication = () => {
		const currentApplication = qPassportApplications.data?.find(
			application =>
				[
					MyPassportFormStatus.Draft,
					MyPassportFormStatus.Ready,
				].includes(application.status),
		);

		return currentApplication;
	};

	const getPreviousApplications = () => {
		const applications = qPassportApplications.data?.slice(1) ?? [];

		return applications;
	};

	const getLatestIssuedApplication = () => {
		const latestIssuedApplication = qPassportApplications.data?.find(
			application => application.status === MyPassportFormStatus.Issued,
		);

		return latestIssuedApplication;
	};

	return {
		show,
		qPassportApplications,
		mDownloadApplications,
		mImportApplications,
		onClickExportApplications,
		onClickImportApplications,
		onClickCloseExportApplications,
		toggleImportDialog,
		toggleFailedToExportDialog,
		prefetchReferenceData,
		getCurrentApplication,
		getPreviousApplications,
		getLatestIssuedApplication,
	};
};
