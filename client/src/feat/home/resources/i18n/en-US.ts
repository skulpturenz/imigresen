import { CoreRouteTitle } from "core/constants/core-route.enum";

export const resources = {
	metaTitle: CoreRouteTitle.Home,
	doApply: "Create a new application",
	doExport: "Export",
	doImport: "Import",
	exportAlertTitle: "Export your data",
	exportAlertDescription: [
		"Your data is not saved to the cloud and can be lost in the event of failure, save a local copy by exporting it.",
		"Login or register to save your data to the cloud",
	].join(" "),
	exportFailedDialogTitle: "Failed to export some applications",
	exportFailedDialogDescription: (automergeUrls: string[]) =>
		automergeUrls.join(", "),
	doCloseExportFailedDialog: "Ok",
};
