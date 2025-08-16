import { useI18n } from "core/context/i18n";
import { toRequired, whenOptions } from "core/data/yup/utils";
import { invariant } from "es-toolkit";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import type { FormContext } from "feat/my-passport-form/types";
import { object, string } from "yup";
import { constants } from "./constants";
import { isPublished } from "./utils";

export const addressDetails = object({
	streetAddress: string()
		.matches(constants.regex.alphanumericWithSpaces, {
			excludeEmptyString: true,
			message: () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.alphanumeric");
			},
		})
		.when(whenOptions(isPublished, toRequired)),
	postcode: string()
		.matches(constants.regex.numeric, {
			excludeEmptyString: true,
			message: () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.numeric");
			},
		})
		.when(whenOptions(isPublished, toRequired)),
	city: string()
		.matches(constants.regex.alphanumericWithSpaces, {
			excludeEmptyString: true,
			message: () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.alphanumeric");
			},
		})
		.when(whenOptions(isPublished, toRequired)),
	state: string()
		.matches(constants.regex.alphanumericWithSpaces, {
			excludeEmptyString: true,
			message: () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.alphanumeric");
			},
		})
		.when(whenOptions(isPublished, toRequired)),
	countryCode: string()
		.test((value, testContext) => {
			if (!value) {
				return true;
			}

			const t = useI18n<typeof resources>();
			const context = testContext.options.context as FormContext;
			invariant(
				context.dropdownOptions,
				"Reference data not defined in yup context",
			);

			if (!context.dropdownOptions()?.countryOptions[value]) {
				return testContext.createError({
					message: t("form.errors.invalidOption"),
				});
			}

			return true;
		})
		.when(whenOptions(isPublished, toRequired)),
});
