import { flatten } from "@solid-primitives/i18n";

export const fetcher = async (locale: string) => {
	const { resources } = await import(`./i18n/${locale}.ts`);

	return flatten(resources);
};
