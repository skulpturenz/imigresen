import { useI18n } from "core/context/i18n";
import { toRequired, whenOptions } from "core/data/yup/utils";
import { partialRight } from "es-toolkit";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import { boolean, object, string } from "yup";
import { isPublished } from "./utils";

export const declaration = object({
	isDetailsCorrect: boolean().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	confirmPreviousDocumentNumber: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	declareTrueAndCorrect: boolean().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	isLiable: boolean().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
});
