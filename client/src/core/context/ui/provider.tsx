import { createUiContext } from "core/context/initializers";
import {
	createContext,
	Show,
	type Component,
	type ParentProps,
} from "solid-js";
import { useStore, type UiSvc } from "./store";

export const UiContext = createContext<UiSvc>(createUiContext());

export const UiProvider: Component<ParentProps> = props => {
	const value = useStore();

	return (
		<UiContext.Provider value={value()}>
			<Show when={!value().isInitialLoading}>{props.children}</Show>
		</UiContext.Provider>
	);
};
