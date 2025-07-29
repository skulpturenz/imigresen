import { useI18n } from "core/context/i18n";
import type { resources } from "feat/profile/resources/i18n/en-us";
import { object, string } from "yup";
import { constants } from "./constants";

export const userDetailsSchema = object({
	email: string().email(() => {
		const t = useI18n<typeof resources>();

		return t("form.errors.email");
	}),
	firstName: string()
		.min(constants.fieldConstraints.nameMinChars, () => {
			const t = useI18n<typeof resources>();

			return t(
				"form.errors.minChars",
				constants.fieldConstraints.nameMinChars,
			);
		})
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
		.min(constants.fieldConstraints.nameMinChars, () => {
			const t = useI18n<typeof resources>();

			return t(
				"form.errors.minChars",
				constants.fieldConstraints.nameMinChars,
			);
		})
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
});
