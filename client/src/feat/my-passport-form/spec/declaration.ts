import { useI18n } from "core/context/i18n";
import {
	toRequired,
	whenOptions,
	type ResolveOptions,
} from "core/data/yup/utils";
import { partialRight } from "es-toolkit";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import { boolean, BooleanSchema, object, string, type Message } from "yup";
import { constants } from "./constants";
import { isPublished } from "./utils";

const mustAccept = <T extends BooleanSchema>(
	schema: T,
	_options: ResolveOptions,
	message?: Message<any>,
) => schema.isTrue(message);

export const declaration = object({
	isDetailsCorrect: boolean()
		.when(
			whenOptions(
				isPublished,
				partialRight(toRequired, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		)
		.when(
			whenOptions(
				isPublished,
				partialRight(mustAccept, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		),
	confirmPreviousDocumentNumber: string()
		.when(
			whenOptions(
				isPublished,
				partialRight(toRequired, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		)
		.matches(constants.regex.alphanumericWithSpaces, {
			excludeEmptyString: true,
			message: () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.alphanumeric");
			},
		}),
	declareTrueAndCorrect: boolean()
		.when(
			whenOptions(
				isPublished,
				partialRight(toRequired, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		)
		.when(
			whenOptions(
				isPublished,
				partialRight(mustAccept, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		),
	isLiable: boolean()
		.when(
			whenOptions(
				isPublished,
				partialRight(toRequired, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		)
		.when(
			whenOptions(
				isPublished,
				partialRight(mustAccept, () => {
					const t = useI18n<typeof resources>();

					return t("form.errors.required");
				}),
			),
		),
});
