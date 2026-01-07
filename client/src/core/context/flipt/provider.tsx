import { ErrorBoundary } from "core/context/error-boundary";
import { createFliptContext } from "core/context/initializers";
import { Track } from "core/context/utils";
import {
	createContext,
	onCleanup,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "ui/alert-dialog";
import { resources } from "./resources";
import { useStore, type FliptSvc } from "./store";

export const FliptContext =
	createContext<Accessor<FliptSvc>>(createFliptContext);

const FliptProviderWithoutErrorBoundary: Component<ParentProps> = props => {
	const value = useStore();

	const onMount = async () => {
		return value().actions.init();
	};

	onCleanup(() => {
		if (value().isInitialLoading || value().isInitialError) {
			return;
		}

		value().actions.close();
	});

	return (
		<>
			<Track fn={onMount} />

			<FliptContext.Provider value={value}>
				<Show when={!value().isInitialLoading}>{props.children}</Show>

				<Show when={value().isInitialError}>
					<DegradationDialog />
				</Show>
			</FliptContext.Provider>
		</>
	);
};

export const FliptProvider: Component<ParentProps> = props => (
	<ErrorBoundary>
		<FliptProviderWithoutErrorBoundary>
			{props.children}
		</FliptProviderWithoutErrorBoundary>
	</ErrorBoundary>
);

const DegradationDialog: Component = _props => {
	return (
		<AlertDialog defaultOpen>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{resources.degradationDialog.title}
					</AlertDialogTitle>
					<AlertDialogDescription class="whitespace-pre-line">
						{resources.degradationDialog.description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogAction>
						{resources.degradationDialog.doOk}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
