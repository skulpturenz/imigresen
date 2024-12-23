import { createUserContext } from "core/context/initializers";
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

	onMount(() => {
		value().actions.init();
	});

	return (
		<UserContext.Provider value={value}>
			<Show when={!value().isInitialLoading}>{props.children}</Show>
		</UserContext.Provider>
	);
};
