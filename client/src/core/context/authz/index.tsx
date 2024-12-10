import { createAuthzContext } from "core/context/initializers";
import { createContext, type Component, type ParentProps } from "solid-js";

export type AuthzContext = Record<string, unknown>;

export const AuthzContext = createContext<AuthzContext>(createAuthzContext());

export const AuthzProvider: Component<ParentProps> = props => {
	return (
		<AuthzContext.Provider value={createAuthzContext()}>
			{props.children}
		</AuthzContext.Provider>
	);
};
