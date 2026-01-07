import {
	ErrorBoundary as SolidErrorBoundary,
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

interface UserErrorBoundaryProps {
	onClickOk?: () => void;
}

interface FallbackProps {
	err: any;
	reset: () => void;
}

export const ErrorBoundary: Component<
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
		<SolidErrorBoundary
			fallback={(err, reset) => <Fallback err={err} reset={reset} />}>
			{props.children}
		</SolidErrorBoundary>
	);
};
