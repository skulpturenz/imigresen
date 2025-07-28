import { boolean, object, string } from "yup";

export const declaration = object({
	isDetailsCorrect: boolean(),
	confirmPreviousDocumentNumber: string(),
	declareTrueAndCorrect: boolean(),
	isLiable: boolean(),
});
