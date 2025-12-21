import { useI18n } from "core/context/i18n";
import { toRequired, whenOptions } from "core/data/yup/utils";
import { partialRight } from "es-toolkit";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import { object, string } from "yup";
import { constants } from "./constants";
import { isPublished } from "./utils";

export const previousDocuments = object({
	dependentCaregiverFirstName: string()
		.when(
			whenOptions(isPublished, schema =>
				schema.min(constants.fieldConstraints.nameMinChars, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		)
		.max(constants.fieldConstraints.nameMaxChars, () => {
			const t = useI18n<typeof resources>();

			return t(
				"form.errors.maxChars",
				constants.fieldConstraints.nameMaxChars,
			);
		})
		.matches(constants.regex.alphanumericWithSpaces, {
			excludeEmptyString: true,
			message: () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.alphanumeric");
			},
		})
		.when(
			whenOptions(
				isPublished,
				partialRight(toRequired, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		),
	dependentCaregiverLastName: string()
		.when(
			whenOptions(isPublished, schema =>
				schema.min(constants.fieldConstraints.nameMinChars, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		)
		.max(constants.fieldConstraints.nameMaxChars, () => {
			const t = useI18n<typeof resources>();

			return t(
				"form.errors.maxChars",
				constants.fieldConstraints.nameMaxChars,
			);
		})
		.matches(constants.regex.alphanumericWithSpaces, {
			excludeEmptyString: true,
			message: () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.alphanumeric");
			},
		})
		.when(
			whenOptions(
				isPublished,
				partialRight(toRequired, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		),
	dependentCaregiverMyKadNumber: string()
		.when(
			whenOptions(
				isPublished,
				partialRight(toRequired, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		)
		.matches(constants.regex.myKadNumber, {
			excludeEmptyString: true,
			message: () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.invalidMyKadNumber");
			},
		}),
	dependentCaregiverSignature: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	previousDocumentNumber: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
});
