import { createRouterContext } from "core/context/initializers";
import {
	createContext,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { PageLoading } from "ui/page-loading";
import { cn } from "ui/utils";
import { useStore, type RouterSvc } from "./store";

export const RouterContext =
	createContext<Accessor<RouterSvc>>(createRouterContext);

export const RouterProvider: Component<ParentProps> = props => {
	const value = useStore();

	// TODO: without `Show` animations don't seem to run
	return (
		<RouterContext.Provider value={value}>
			<Show when={value().isInitialLoading()}>
				<PageLoading isLoading={value().isInitialLoading()} />
			</Show>

			<div
				class={cn(
					value().isInitialLoading() ? "opacity-0" : "opacity-100",
				)}>
				{props.children}
			</div>
		</RouterContext.Provider>
	);
};
