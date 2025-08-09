import { useI18n } from "core/context/i18n";
import { toRequired, whenOptions } from "core/data/yup/utils";
import { partialRight } from "es-toolkit";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import { object, string } from "yup";
import { constants } from "./constants";
import { isPublished } from "./utils";

export const personalDetails = object({
	firstName: string()
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
		.matches(constants.regex.alphanumeric, () => {
			const t = useI18n<typeof resources>();

			return t("form.errors.alphanumeric");
		}),
	lastName: string()
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
		.matches(constants.regex.alphanumeric, () => {
			const t = useI18n<typeof resources>();

			return t("form.errors.alphanumeric");
		}),
	nickName: string()
		.max(constants.fieldConstraints.nameMaxChars, () => {
			const t = useI18n<typeof resources>();

			return t(
				"form.errors.maxChars",
				constants.fieldConstraints.nameMaxChars,
			);
		})
		.matches(constants.regex.alphanumeric, () => {
			const t = useI18n<typeof resources>();

			return t("form.errors.alphanumeric");
		}),
	genderCode: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	dateOfBirth: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	countryOfBirthCode: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	stateOfBirth: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	height: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	emailAddress: string()
		.email(() => {
			const t = useI18n<typeof resources>();

			return t("form.errors.email");
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
	mobileNumber: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	relationshipStatusCode: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
});
