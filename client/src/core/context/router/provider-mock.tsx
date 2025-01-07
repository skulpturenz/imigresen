import {
	mergeProps,
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

	return (
		<RouterContext.Provider value={withDefaultProps.svc}>
			<PageLoading
				isLoading={withDefaultProps.svc().isInitialLoading()}
			/>

			<div
				class={cn(
					value().isInitialLoading() ? "opacity-0" : "opacity-100",
				)}>
				{withDefaultProps.children}
			</div>
		</RouterContext.Provider>
	);
};
