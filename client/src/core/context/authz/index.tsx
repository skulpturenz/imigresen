import { createAuthzContext } from "core/context/initializers";
import {
	createContext,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";

export type AuthzContext = Record<string, unknown>;

export const AuthzContext =
	createContext<Accessor<AuthzContext>>(createAuthzContext);

export const AuthzProvider: Component<ParentProps> = props => {
	return (
		<AuthzContext.Provider value={createAuthzContext}>
			{props.children}
		</AuthzContext.Provider>
	);
};
