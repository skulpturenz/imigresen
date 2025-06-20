import { AuthnContext } from "core/context/authn";
import { createUserContext } from "core/context/initializers";
import { useContext } from "core/context/utils";
import {
	createContext,
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { useStore, type UserSvc } from "./store";

export const UserContext = createContext<Accessor<UserSvc>>(createUserContext);

export const UserProvider: Component<ParentProps> = props => {
	const value = useStore();
	const authnContext = useContext(AuthnContext);

	// TODO: once BE is up properly this should not be dependent on `authn`
	// `authn` just authenticates
	onMount(() => {
		if (authnContext().isInitialLoading) {
			return;
		}

		const profile = authnContext().profile;

		value().actions.init(profile);
	});

	return (
		<UserContext.Provider value={value}>
			<Show when={!value().isInitialLoading}>{props.children}</Show>
		</UserContext.Provider>
	);
};
