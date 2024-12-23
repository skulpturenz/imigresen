import { createAuthnContext } from "core/context/initializers";
import {
	mergeProps,
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { AuthnContext } from "./provider";
import { type AuthnSvc } from "./store";

export interface AuthnProviderMockProps {
	svc?: Accessor<AuthnSvc>;
}

export const AuthnProviderMock: Component<
	ParentProps<AuthnProviderMockProps>
> = props => {
	const withDefaultProps = mergeProps(
		{
			svc: () => ({
				...createAuthnContext(),
				isInitialLoading: false,
			}),
		},
		props,
	);

	onMount(() => {
		withDefaultProps.svc().actions.init();
	});

	return (
		<AuthnContext.Provider value={withDefaultProps.svc}>
			<Show when={!withDefaultProps.svc().isInitialLoading}>
				{withDefaultProps.children}
			</Show>
		</AuthnContext.Provider>
	);
};
