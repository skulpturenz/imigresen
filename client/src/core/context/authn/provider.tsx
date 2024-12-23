import { createAuthnContext } from "core/context/initializers";
import {
	createContext,
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { useStore, type AuthnSvc } from "./store";

export const AuthnContext =
	createContext<Accessor<AuthnSvc>>(createAuthnContext);

export const AuthnProvider: Component<ParentProps> = props => {
	const value = useStore();

	onMount(() => {
		value().actions.init();
	});

	// TODO: remove buttons
	return (
		<AuthnContext.Provider value={value}>
			<Show when={!value().isInitialLoading}>{props.children}</Show>
		</AuthnContext.Provider>
	);
};
