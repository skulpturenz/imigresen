import { useQueryClient } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { createUserContext } from "core/context/initializers";
import { useContext } from "core/context/utils";
import {
	createContext,
	ErrorBoundary,
	getOwner,
	runWithOwner,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "ui/alert-dialog";
import { resources } from "./resources";
import { useStore, type UserSvc } from "./store";

export const UserContext = createContext<Accessor<UserSvc>>(createUserContext);

interface TrackProps {
	fn?: () => Promise<void>;
}

const Track: Component<TrackProps> = props => {
	const owner = getOwner();

	// workaround to make error boundaries catch errors which occur async (event handlers, setTimeout)
	// `fn` must be async. if its sync which calls an async function (which throws) then the error
	// will not propagate correctly
	// based on: https://github.com/solidjs/solid/discussions/1174
	props.fn?.().catch(err =>
		runWithOwner(owner, () => {
			throw err;
		}),
	);

	return null;
};

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
		<UserErrorBoundary onClickOk={onClickOk}>
			<UserProviderWithoutErrorBoundary>
				{props.children}
			</UserProviderWithoutErrorBoundary>
		</UserErrorBoundary>
	);
};

interface UserErrorBoundaryProps {
	onClickOk?: () => void;
}

interface FallbackProps {
	err: any;
	reset: () => void;
}

const UserErrorBoundary: Component<
	ParentProps<UserErrorBoundaryProps>
> = props => {
	const Fallback: Component<FallbackProps> = fallbackProps => {
		const onClickOk = () => {
			fallbackProps.reset();
			props.onClickOk?.();
		};

		return (
			<AlertDialog defaultOpen>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{resources.errorBoundary.title}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{resources.errorBoundary.description}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogClose onClick={onClickOk}>
							{resources.errorBoundary.doCancel}
						</AlertDialogClose>
						<AlertDialogAction onClick={onClickOk}>
							{resources.errorBoundary.doOk}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	};

	return (
		<ErrorBoundary
			fallback={(err, reset) => <Fallback err={err} reset={reset} />}>
			{props.children}
		</ErrorBoundary>
	);
};
