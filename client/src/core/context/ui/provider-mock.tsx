import { onMount, Show, type Component, type ParentProps } from "solid-js";
import { UiContext } from "./provider";
import { type AuthnSvc } from "./store";

export interface AuthnProviderMockProps {
	svc: AuthnSvc;
}

export const AuthnProviderMock: Component<
	ParentProps<AuthnProviderMockProps>
> = props => {
	onMount(() => {
		props.svc.actions.init();
	});

	return (
		<UiContext.Provider value={props.svc}>
			<Show when={!props.svc.isInitialLoading}>{props.children}</Show>
		</UiContext.Provider>
	);
};
