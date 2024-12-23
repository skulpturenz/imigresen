import {
	mergeProps,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { RouterContext } from "./provider";
import { useStore, type RouterSvc } from "./store";

export interface RouterProviderMockProps {
	svc?: Accessor<RouterSvc>;
}

export const RouterProviderMock: Component<
	ParentProps<RouterProviderMockProps>
> = props => {
	const value = useStore();
	const withDefaultProps = mergeProps(
		{
			svc: value,
		},
		props,
	);

	return (
		<RouterContext.Provider value={withDefaultProps.svc}>
			{withDefaultProps.children}
		</RouterContext.Provider>
	);
};
