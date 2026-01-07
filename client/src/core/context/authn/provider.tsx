import { ErrorBoundary } from "core/context/error-boundary";
import { createAuthnContext } from "core/context/initializers";
import { Track } from "core/context/utils";
import {
	createContext,
	onCleanup,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { useStore, type AuthnSvc } from "./store";

export const AuthnContext =
	createContext<Accessor<AuthnSvc>>(createAuthnContext);

const AuthnProviderWithoutErrorBoundary: Component<ParentProps> = props => {
	const value = useStore();

	const onMount = async () => {
		return value().actions.init();
	};

	onCleanup(() => {
		if (value().isInitialLoading) {
			return;
		}

		value().actions.cleanup();
	});

	return (
		<>
			<Track fn={onMount} />
			<AuthnContext.Provider value={value}>
				<Show when={!value().isInitialLoading}>{props.children}</Show>
			</AuthnContext.Provider>
		</>
	);
};

export const AuthnProvider: Component<ParentProps> = props => (
	<ErrorBoundary>
		<AuthnProviderWithoutErrorBoundary>
			{props.children}
		</AuthnProviderWithoutErrorBoundary>
	</ErrorBoundary>
);
