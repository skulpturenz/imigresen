import { toRequired, whenOptions } from "core/data/yup/utils";
import { object, string } from "yup";
import { isPublished } from "./utils";

export const previousDocuments = object({
	dependentCaregiverFirstName: string().when(
		whenOptions(isPublished, toRequired),
	),
	dependentCaregiverLastName: string().when(
		whenOptions(isPublished, toRequired),
	),
	dependentCaregiverMyKadNumber: string().when(
		whenOptions(isPublished, toRequired),
	),
	dependentCaregiverSignature: string().when(
		whenOptions(isPublished, toRequired),
	),
	previousDocumentNumber: string().when(whenOptions(isPublished, toRequired)),
});
