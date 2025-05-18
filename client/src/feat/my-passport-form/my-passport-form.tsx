import { useI18n } from "core/context/i18n";
import { Typography } from "ui/typography";
import type { resources } from "./resources/i18n/en-US";

export const MyPassportForm = () => {
	const t = useI18n<typeof resources>();

	return <Typography>{t("helloWorld")}</Typography>;
};
