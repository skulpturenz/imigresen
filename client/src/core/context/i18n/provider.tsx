import { useLocale } from "@kobalte/core";
import { flatten, translator, type Flatten } from "@solid-primitives/i18n";
import { useContext } from "core/context/utils";
import {
	createContext,
	createResource,
	Suspense,
	type Component,
	type ParentProps,
	type Resource,
} from "solid-js";
import { PageLoading } from "ui/page-loading";

export const I18nContext = createContext<I18nSvc | null>(null);

export interface I18nSvc<T extends Record<string, any> = Record<string, any>> {
	i18n: Resource<Flatten<T>>;
}

export interface I18nProviderProps<
	T extends Record<string, any> = Record<string, any>,
> {
	fetcher: (locale: string) => Promise<Flatten<T>>;
	initialValue?: Flatten<T>;
}

export const I18nProvider: Component<
	ParentProps<I18nProviderProps>
> = props => {
	const { locale } = useLocale();

	const [i18n] = createResource(locale, props.fetcher, {
		initialValue: props.initialValue,
	});

	return (
		<>
			<PageLoading isLoading={i18n.loading} />

			<Suspense>
				<I18nContext.Provider
					value={{
						i18n,
					}}>
					{props.children}
				</I18nContext.Provider>
			</Suspense>
		</>
	);
};

export const withI18n =
	({ fetcher, initialValue }: I18nProviderProps) =>
	(Component: Component) => (
		<I18nProvider fetcher={fetcher} initialValue={initialValue}>
			<Component />
		</I18nProvider>
	);

export const useI18n = (fallback?: Record<string, any>) => {
	const i18nContext = useContext(I18nContext);

	return translator(
		i18nContext.i18n ?? flatten(fallback ?? Object.create(null)),
	);
};
