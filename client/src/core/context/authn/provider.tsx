import { createAuthnContext } from "core/context/initializers";
import {
	createContext,
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { useStore, type AuthnSvc } from "./store";

export const AuthnContext =
	createContext<Accessor<AuthnSvc>>(createAuthnContext);

export const AuthnProvider: Component<ParentProps> = props => {
	const value = useStore();

	onMount(() => {
		value().actions.init();
	});

	// TODO: improve
	const Loading = () => <span>Loading!!!</span>;

	// TODO: remove buttons
	return (
		<AuthnContext.Provider value={value}>
			<Show when={!value().isInitialLoading} fallback={<Loading />}>
				<button on:click={value().actions.login}>
					Click here login!
				</button>
				<button on:click={value().actions.register}>
					Click here register!
				</button>
				<button on:click={value().actions.logout}>
					Click here to logout!!
				</button>
				<span>
					isAuthenticated:&nbsp;
					{JSON.stringify(Boolean(value().keycloak?.authenticated))}
				</span>
				{props.children}
			</Show>
		</AuthnContext.Provider>
	);
};
