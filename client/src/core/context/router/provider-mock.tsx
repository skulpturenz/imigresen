import { type Component, type ParentProps } from "solid-js";
import { RouterContext } from "./provider";
import { type RouterSvc } from "./store";

export interface RouterProviderMockProps {
	svc: RouterSvc;
}

export const RouteProviderMock: Component<
	ParentProps<RouterProviderMockProps>
> = props => {
	return (
		<RouterContext.Provider value={props.svc}>
			{props.children}
		</RouterContext.Provider>
	);
};
