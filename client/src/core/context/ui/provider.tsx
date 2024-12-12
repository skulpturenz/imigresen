import { createUiContext } from "core/context/initializers";
import { createContext, type Component, type ParentProps } from "solid-js";
import { useStore, type UiSvc } from "./store";

export const UiContext = createContext<UiSvc>(createUiContext());

export const UiProvider: Component<ParentProps> = props => {
	const value = useStore();

	return (
		<UiContext.Provider value={value()}>
			{props.children}
		</UiContext.Provider>
	);
};
