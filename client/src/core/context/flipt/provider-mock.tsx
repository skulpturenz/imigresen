import { createFliptContext } from "core/context/initializers";
import {
	mergeProps,
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { FliptContext } from "./provider";
import { type FliptSvc } from "./store";

export interface FliptProviderMockProps {
	svc?: Accessor<FliptSvc>;
}

export const FliptProviderMock: Component<
	ParentProps<FliptProviderMockProps>
> = props => {
	const withDefaultProps = mergeProps(
		{
			svc: () => ({
				...createFliptContext(),
				isInitialLoading: false,
			}),
		},
		props,
	);

	onMount(() => {
		withDefaultProps.svc().actions.init();

		return () => {
			withDefaultProps.svc().actions.close();
		};
	});

	return (
		<FliptContext.Provider value={withDefaultProps.svc}>
			<Show when={!withDefaultProps.svc().isInitialLoading}>
				{withDefaultProps.children}
			</Show>
		</FliptContext.Provider>
	);
};
