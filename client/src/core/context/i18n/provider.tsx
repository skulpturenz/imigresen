import { useLocale } from "@kobalte/core";
import { translator, type Flatten } from "@solid-primitives/i18n";
import type { Locale } from "core/context/ui";
import { spreadProps } from "core/utils";
import { invariant } from "es-toolkit";
import {
	createContext,
	createResource,
	Show,
	Suspense,
	useContext,
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

	const [i18n] = createResource(locale as Accessor<Locale>, props.fetcher, {
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
	(Component: Component) =>
	(props: ParentProps<any>) => (
		<I18nProvider fetcher={fetcher} initialValue={initialValue}>
			<Component {...spreadProps(props)} />
		</I18nProvider>
	);

export const useI18n = <
	T extends Record<string, any> = Record<string, any>,
>() => {
	const i18nContext = useContext(I18nContext);

	invariant(i18nContext, "`useI18n` must be used within an `I18nContext`");

	return translator<Flatten<T>>(i18nContext.i18n as Accessor<Flatten<T>>);
};
