import { type ClassValue, clsx } from "clsx";
import { invariant } from "es-toolkit";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const plural = (
	rules: Intl.PluralRules,
	variants: Record<string, Record<Intl.LDMLPluralRule, string>>,
	count: number,
) => {
	const { locale } = rules.resolvedOptions();

	const word = variants[locale]?.[rules.select(count)];

	invariant(word, "Plural form not defined");

	return word;
};
