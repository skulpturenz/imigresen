import { createFliptContext } from "core/context/initializers";
import { createContext, type Component, type ParentProps } from "solid-js";

export type FliptContext = Record<string, unknown>;

export const FliptContext = createContext<FliptContext>(createFliptContext());

export const FliptProvider: Component<ParentProps> = props => {
	return (
		<FliptContext.Provider value={createFliptContext()}>
			{props.children}
		</FliptContext.Provider>
	);
};
