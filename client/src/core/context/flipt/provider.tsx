import { createFliptContext } from "core/context/initializers";
import {
	createContext,
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { useStore, type FliptSvc } from "./store";

export const FliptContext =
	createContext<Accessor<FliptSvc>>(createFliptContext);

export const FliptProvider: Component<ParentProps> = props => {
	const value = useStore();

	onMount(() => {
		value().actions.init();

		return () => {
			value().actions.close();
		};
	});

	// TODO: improve
	const Loading = () => <span>Loading!!!</span>;

	return (
		<FliptContext.Provider value={value}>
			<Show when={!value().isInitialLoading} fallback={<Loading />}>
				{props.children}
			</Show>
		</FliptContext.Provider>
	);
};
