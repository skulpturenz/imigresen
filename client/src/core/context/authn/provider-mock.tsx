import {
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { AuthnContext } from "./provider";
import { type AuthnSvc } from "./store";

export interface AuthnProviderMockProps {
	svc: Accessor<AuthnSvc>;
}

export const AuthnProviderMock: Component<
	ParentProps<AuthnProviderMockProps>
> = props => {
	onMount(() => {
		props.svc().actions.init();
	});

	return (
		<AuthnContext.Provider value={props.svc}>
			<Show when={!props.svc().isInitialLoading}>{props.children}</Show>
		</AuthnContext.Provider>
	);
};
