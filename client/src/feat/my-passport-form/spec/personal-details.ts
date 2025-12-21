import { useI18n } from "core/context/i18n";
import { toRequired, whenOptions } from "core/data/yup/utils";
import { invariant, partialRight } from "es-toolkit";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import type { FormContext } from "feat/my-passport-form/types";
import { number, object, string } from "yup";
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
	nickName: string()
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
		}),
	genderCode: string()
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

			if (!context.dropdownOptions()?.genderOptions[value]) {
				return testContext.createError({
					message: t("form.errors.invalidOption"),
				});
			}

			return true;
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
	dateOfBirth: string().when(
		whenOptions(
			isPublished,
			partialRight(toRequired, () => {
				const t = useI18n<typeof resources>();

				return t("form.errors.required");
			}),
		),
	),
	countryOfBirthCode: string()
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
		.when(
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
	height: number()
		// note: `undefined` is important here
		// there are two validations that happen when a form is submitted:
		// - first validation in draft mode
		// - second validation in publish mode by the submit handler
		//
		// if value is transformed to `null`, then the spec throws at the first validation
		// and when we try to submit an empty form we don't get to the second stage which shows all
		// the required field validations
		.transform(value => value || undefined)
		.min(constants.fieldConstraints.heightMin, () => {
			const t = useI18n<typeof resources>();

			return t(
				"form.errors.minHeight",
				constants.fieldConstraints.heightMin,
			);
		})
		.max(constants.fieldConstraints.heightMax, () => {
			const t = useI18n<typeof resources>();

			return t(
				"form.errors.maxHeight",
				constants.fieldConstraints.heightMax,
			);
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
	relationshipStatusCode: string()
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

			if (!context.dropdownOptions()?.relationshipStatusOptions[value]) {
				return testContext.createError({
					message: t("form.errors.invalidOption"),
				});
			}

			return true;
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
});
