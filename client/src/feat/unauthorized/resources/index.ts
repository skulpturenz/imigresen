import { flatten } from "@solid-primitives/i18n";
import { makeWithI18n } from "core/context/i18n";
import type { Locale } from "core/context/ui";

export const fetcher = async (locale: Locale) => {
	const { resources } = await import(`./i18n/${locale}.ts`);

	return flatten(resources);
};

export const withI18n = makeWithI18n({ fetcher });
