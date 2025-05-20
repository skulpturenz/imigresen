import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import { Button } from "ui/button";

export const MobileFooter = () => {
	const t = useI18n<typeof resources>();

	return (
		<div
			// `isVerySmall`
			class="flex-col sm:hidden space-y-4 mb-4">
			<Button variant="secondary" class="w-full">
				{t("doBack")}
			</Button>

			<Button variant="default" class="w-full">
				{t("doNext")}
			</Button>

			<Button variant="destructive" class="w-full">
				{t("doDelete")}
			</Button>
		</div>
	);
};

export const DefaultFooter = () => {
	const t = useI18n<typeof resources>();

	return (
		<div
			// `isSmall` and up
			class="hidden sm:flex justify-between mt-4">
			<div class="flex space-x-2">
				<Button variant="destructive">{t("doDelete")}</Button>
				<Button variant="secondary">{t("doBack")}</Button>
			</div>

			<Button variant="default">{t("doNext")}</Button>
		</div>
	);
};
