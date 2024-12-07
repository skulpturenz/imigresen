import { createContext, type Component, type ParentProps } from "solid-js";

export type UserContext = Record<string, unknown>;

export const UserContext = createContext<UserContext>(Object.create(null));

export const UserProvider: Component<ParentProps> = props => {
	return (
		<UserContext.Provider value={Object.create(null)}>
			{props.children}
		</UserContext.Provider>
	);
};
