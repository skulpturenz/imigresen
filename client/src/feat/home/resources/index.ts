import { flatten } from "@solid-primitives/i18n";
import { makeWithI18n } from "core/context/i18n";

export const fetcher = async (locale: string) => {
	const { resources } = await import(`./i18n/${locale}.ts`);

	return flatten(resources);
};

export const withI18n = makeWithI18n({ fetcher });
