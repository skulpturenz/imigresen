import { createContext, type Component, type ParentProps } from "solid-js";

export type FliptContext = Record<string, unknown>;

export const FliptContext = createContext<FliptContext>(Object.create(null));

export const FliptProvider: Component<ParentProps> = props => {
	return (
		<FliptContext.Provider value={Object.create(null)}>
			{props.children}
		</FliptContext.Provider>
	);
};
