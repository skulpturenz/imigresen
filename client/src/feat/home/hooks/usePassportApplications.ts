import { useMutation, useQuery } from "@tanstack/solid-query";
import { queryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { HomeContext } from "feat/home/context";
import { exportData } from "feat/home/utils";
import { createSignal } from "solid-js";

export const usePassportApplications = () => {
	const authnContext = useContext(AuthnContext);
	const homeContext = useContext(HomeContext);

	const [show, setShow] = createSignal({
		importDialog: false,
		importFilesButton: false,
		failedToExportDialog: false,
	});
	const toggleImportDialog = () =>
		setShow(show => ({ ...show, importDialog: !show.importDialog }));
	const toggleImportFilesButton = () =>
		setShow(show => ({
			...show,
			importFilesButton: !show.importFilesButton,
		}));
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
		queryFn: homeContext.getPassportApplications,
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

		await mImportApplications.mutateAsync(files);

		qPassportApplications.refetch();

		toggleImportFilesButton();
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
		toggleImportFilesButton,
		toggleFailedToExportDialog,
	};
};
