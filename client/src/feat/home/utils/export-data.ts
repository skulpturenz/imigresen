import { formatDate } from "date-fns";

export const exportData = (
	fileName: string,
	mime: keyof typeof fileExtensionMimeTypes,
	data: BlobPart[] | BlobPart,
) => {
	const file = new Blob([data].flat(), { type: mime });

	const element = document.createElement("a");
	const objectUrl = URL.createObjectURL(file);
	element.setAttribute("href", objectUrl);
	element.setAttribute(
		"download",
		[
			[fileName, formatDate(new Date(), "dd-MM-yyyy")].join("-"),
			fileExtensionMimeTypes[mime],
		]
			.filter(Boolean)
			.join("."),
	);

	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
	URL.revokeObjectURL(objectUrl);
};

const fileExtensionMimeTypes = {
	"application/json": "json",
} as const;
