import { CoreRouteTitle } from "core/constants/core-route.enum";
import type { IssuedMyPassportForm } from "feat/home/types";

export const resources = {
	metaTitle: CoreRouteTitle.Home,
	doApply: "Create a new application",
	doExport: "Export",
	doImport: "Import",
	importDialogTitle: "Import applications",
	importDialogDescription: "Import passport applications from an export file",
	doImportApplication: "Import",
	doFinishImport: "Finish",
	doCloseImportDialog: "Close",
	exportAlertTitle: "Export your data",
	exportAlertDescription: [
		"Your data is not saved to the cloud and can be lost in the event of failure, save a local copy by exporting it.",
		"Login or register to save your data to the cloud",
	].join(" "),
	exportFailedDialogTitle: "Failed to export some applications",
	exportFailedDialogDescription: (automergeUrls: string[]) =>
		automergeUrls.join(", "),
	doCloseExportFailedDialog: "Ok",
	placeholder: "Placeholder",
	timeUnit: {
		years: "years",
		months: "months",
		weeks: "weeks",
		today: "today",
		days: "days",
	},
	status: {
		draft: "Draft",
		ready: "Ready",
		submitted: "Submitted",
		issued: "Issued",
	},
	onboarding: {
		title: "Onboard details of your current passport",
		description: [
			[
				"Imigresen allows you to manage your Malaysian passport applications online,",
				"simplifying the process so that you don't need to scramble for your documents every time you renew.",
				"You can also import any applications you previously created.",
			].join(" "),
			"Imigresen allows you to work locally and export your data for backup or store them in the cloud by registering.",
		].join("\n\n"),
	},
	currentApplication: {
		title: "Current application",
		doViewApplication: "View application",
		applicationType: "Application type",
		documentType: "Document type",
		name: "Applicant name",
		status: "Status",
		progress: "Progress",
		summary: {
			expiresToday: (form: IssuedMyPassportForm) =>
				`Your latest travel document has the number ${form.passportNumber} and is due to expire today`,
			expiresIn: (form: IssuedMyPassportForm) =>
				`Your latest travel document has the number ${form.passportNumber} and is due to expire in `,
		},
	},
	pastApplications: {
		title: "Past applications",
		placeholderSearch: "Search ...",
		tableColumns: {
			requestType: "Application type",
			documentType: "Document type",
			name: "Name",
			status: "Status",
			dateIssued: "Date issued",
			actions: "Actions",
		},
	},
	v2: {
		logo: "Imigresen",
		askMeAnything: "Ask me anything (imigresen related) ...",
		doSubmit: "Submit",
	},
};
