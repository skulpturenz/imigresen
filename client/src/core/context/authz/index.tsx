import { createContext, type Component, type ParentProps } from "solid-js";

export type AuthzContext = Record<string, unknown>;

export const AuthzContext = createContext<AuthzContext>(Object.create(null));

export const AuthzProvider: Component<ParentProps> = props => {
	return (
		<AuthzContext.Provider value={Object.create(null)}>
			{props.children}
		</AuthzContext.Provider>
	);
};
