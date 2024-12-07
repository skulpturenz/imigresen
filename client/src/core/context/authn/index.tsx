import { createContext, type Component, type ParentProps } from "solid-js";

export type AuthnContext = Record<string, unknown>;

export const AuthnContext = createContext<AuthnContext>(Object.create(null));

export const AuthnProvider: Component<ParentProps> = props => {
	return (
		<AuthnContext.Provider value={Object.create(null)}>
			{props.children}
		</AuthnContext.Provider>
	);
};
