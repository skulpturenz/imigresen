import { useQueryClient } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { ErrorBoundary } from "core/context/error-boundary";
import { createUserContext } from "core/context/initializers";
import { Track, useContext } from "core/context/utils";
import {
	createContext,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { useStore, type UserSvc } from "./store";

export const UserContext = createContext<Accessor<UserSvc>>(createUserContext);

const UserProviderWithoutErrorBoundary: Component<ParentProps> = props => {
	const queryClient = useQueryClient();
	const authnContext = useContext(AuthnContext);

	const value = useStore({ queryClient });

	const onMount = async () => {
		if (authnContext().isInitialLoading) {
			return;
		}

		const profile = authnContext().profile;

		return value().actions.init(authnContext().keycloak?.token, profile);
	};

	return (
		<>
			<Track fn={onMount} />
			<UserContext.Provider value={value}>
				<Show when={!value().isInitialLoading}>{props.children}</Show>
			</UserContext.Provider>
		</>
	);
};

export const UserProvider: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);
	const onClickOk = () => authnContext().actions.logout();

	return (
		<ErrorBoundary onClickOk={onClickOk}>
			<UserProviderWithoutErrorBoundary>
				{props.children}
			</UserProviderWithoutErrorBoundary>
		</ErrorBoundary>
	);
};
