import { useLocale } from "@kobalte/core";
import { translator, type Flatten } from "@solid-primitives/i18n";
import type { Locale } from "core/context/ui";
import { useContext } from "core/context/utils";
import { spreadProps } from "core/utils";
import {
	createContext,
	createResource,
	Show,
	Suspense,
	type Accessor,
	type Component,
	type ParentProps,
	type Resource,
} from "solid-js";

const I18nContext = createContext<I18nSvc | null>(null);

interface I18nSvc<T extends Record<string, any> = Record<string, any>> {
	i18n: Resource<Flatten<T>>;
}

interface I18nProviderProps<
	T extends Record<string, any> = Record<string, any>,
> {
	fetcher: (locale: Locale) => Promise<Flatten<T>>;
	initialValue?: Flatten<T>;
}

const I18nProvider: Component<ParentProps<I18nProviderProps>> = props => {
	const { locale } = useLocale();

	// if the provider is used outside of `UiProvider` which sets the app default locale
	// then the `locale` will point to the system locale which may or may not be supported
	// in that case, just set things to `en-US`
	const getLocale = (): Locale => {
		const supportedLocales: Locale[] = ["en-US", "en-MY", "ms-MY"];

		if (!supportedLocales.includes(locale() as Locale)) {
			return "en-US";
		}

		return locale() as Locale;
	};

	const [i18n] = createResource(getLocale, props.fetcher, {
		initialValue: props.initialValue,
	});

	return (
		<>
			<Suspense>
				<Show when={i18n()}>
					<I18nContext.Provider
						value={{
							i18n,
						}}>
						{props.children}
					</I18nContext.Provider>
				</Show>
			</Suspense>
		</>
	);
};

export const makeWithI18n =
	({ fetcher, initialValue }: I18nProviderProps) =>
	<T extends Record<string, any>>(Component: Component<T>) =>
	(props: T) => (
		<I18nProvider fetcher={fetcher} initialValue={initialValue}>
			<Component {...spreadProps(props)} />
		</I18nProvider>
	);

export const useI18n = <
	T extends Record<string, any> = Record<string, any>,
>() => {
	const i18nContext = useContext(I18nContext);

	return translator<Flatten<T>>(i18nContext.i18n as Accessor<Flatten<T>>);
};
