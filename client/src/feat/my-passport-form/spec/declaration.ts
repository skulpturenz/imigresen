import { toRequired, whenOptions } from "core/data/yup/utils";
import { boolean, object, string } from "yup";
import { isPublished } from "./utils";

export const declaration = object({
	isDetailsCorrect: boolean(),
	confirmPreviousDocumentNumber: string().when(
		whenOptions(isPublished, toRequired),
	),
	declareTrueAndCorrect: boolean(),
	isLiable: boolean(),
});
