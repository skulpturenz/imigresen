import { createUserContext } from "core/context/initializers";
import { createContext, type Component, type ParentProps } from "solid-js";

export type UserContext = Record<string, unknown>;

export const UserContext = createContext<UserContext>(createUserContext());

export const UserProvider: Component<ParentProps> = props => {
	return (
		<UserContext.Provider value={createUserContext()}>
			{props.children}
		</UserContext.Provider>
	);
};
