import { formatDate } from "date-fns";

export const resources = {
	title: "Import existing applications",
	description: "These applications are currently public and can be imported",
	doCancel: "Cancel",
	doImport: "Import",
	listItemDescription: (createdAt: Date) =>
		`Created on ${formatDate(createdAt, "dd/MM/yyyy")}`,
	toastTitle: "Applications imported",
	toastDescription: (numberOfApplications: number) => {
		const applications =
			numberOfApplications === 1 ? "application" : "applications";

		return `${numberOfApplications} ${applications} imported`;
	},
};
