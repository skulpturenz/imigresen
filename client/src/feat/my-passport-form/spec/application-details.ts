import { toRequired, whenOptions } from "core/data/yup/utils";
import { object, string } from "yup";
import { isPublished } from "./utils";

export const applicationDetails = object({
	documentType: string().when(whenOptions(isPublished, toRequired)),
	requestType: string().when(whenOptions(isPublished, toRequired)),
	myKadNumber: string().when(whenOptions(isPublished, toRequired)),
	birthDocumentNumber: string().when(whenOptions(isPublished, toRequired)),
});
