import { AuthnContext } from "core/context/authn";
import { createUserContext } from "core/context/initializers";
import { useContext } from "core/context/utils";
import {
	createContext,
	getOwner,
	onMount,
	runWithOwner,
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
	const owner = getOwner();

	onMount(() => {
		if (authnContext().isInitialLoading) {
			return;
		}

		const profile = authnContext().profile;

		runWithOwner(owner, () =>
			value().actions.init(authnContext().keycloak?.token, profile),
		);
	});

	return (
		<UserContext.Provider value={value}>
			<Show when={!value().isInitialLoading}>{props.children}</Show>
		</UserContext.Provider>
	);
};
