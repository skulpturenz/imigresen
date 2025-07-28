import { object, string } from "yup";

export const previousDocuments = object({
	dependentCaregiverFirstName: string(),
	dependentCaregiverLastName: string(),
	dependentCaregiverMyKadNumber: string(),
	dependentCaregiverSignature: string(),
	previousDocumentNumber: string(),
});
