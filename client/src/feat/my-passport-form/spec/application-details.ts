import { object, string } from "yup";

export const applicationDetails = object({
	documentType: string(),
	requestType: string(),
	myKadNumber: string(),
	birthDocumentNumber: string(),
});
