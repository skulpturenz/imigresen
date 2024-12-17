import {
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { UiContext } from "./provider";
import { type UiSvc } from "./store";

export interface UiProviderMockProps {
	svc: Accessor<UiSvc>;
}

export const UiProviderMock: Component<
	ParentProps<UiProviderMockProps>
> = props => {
	return (
		<UiContext.Provider value={props.svc}>
			<Show when={!props.svc().isInitialLoading}>{props.children}</Show>
		</UiContext.Provider>
	);
};
