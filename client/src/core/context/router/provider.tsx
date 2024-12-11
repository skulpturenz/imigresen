import { createRouterContext } from "core/context/initializers";
import { createContext, type Component, type ParentProps } from "solid-js";
import { useStore, type RouterSvc } from "./store";

export const RouterContext = createContext<RouterSvc>(createRouterContext());

export const RouterProvider: Component<ParentProps> = props => {
	const value = useStore();

	return (
		<RouterContext.Provider value={value()}>
			{props.children}
		</RouterContext.Provider>
	);
};
