import {
	mergeProps,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { PageLoading } from "ui/page-loading";
import { cn } from "ui/utils";
import { RouterContext } from "./provider";
import { useStore, type RouterSvc } from "./store";

export interface RouterProviderMockProps {
	svc?: Accessor<RouterSvc>;
}

export const RouterProviderMock: Component<
	ParentProps<RouterProviderMockProps>
> = props => {
	const value = useStore();
	const withDefaultProps = mergeProps(
		{
			svc: value,
		},
		props,
	);

	// TODO: without `Show` animations don't seem to run
	return (
		<RouterContext.Provider value={withDefaultProps.svc}>
			<Show when={value().isInitialLoading()}>
				<PageLoading isLoading={value().isInitialLoading()} />
			</Show>

			<div
				class={cn(
					value().isInitialLoading() ? "opacity-0" : "opacity-100",
				)}>
				{withDefaultProps.children}
			</div>
		</RouterContext.Provider>
	);
};
