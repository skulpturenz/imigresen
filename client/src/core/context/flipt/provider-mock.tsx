import { onMount, Show, type Component, type ParentProps } from "solid-js";
import { FliptContext } from "./provider";
import { type FliptSvc } from "./store";

export interface FliptProviderMockProps {
	svc: FliptSvc;
}

export const FliptProviderMock: Component<
	ParentProps<FliptProviderMockProps>
> = props => {
	onMount(() => {
		props.svc.actions.init();

		return () => {
			props.svc.actions.close();
		};
	});

	return (
		<FliptContext.Provider value={props.svc}>
			<Show when={!props.svc.isInitialLoading}>{props.children}</Show>
		</FliptContext.Provider>
	);
};
