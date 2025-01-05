// import { ProvidersMock as Providers } from "core/context/provider-mock";
import { Providers } from "core/context";
import { useI18n } from "core/context/i18n";
import { Router } from "core/router";
import { ErrorBoundary, type Component, type ParentProps } from "solid-js";
import { Portal } from "solid-js/web";
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
import { withI18n } from "./resources";
import type { resources } from "./resources/i18n/en-US";

export const App = () => {
	return (
		<AppErrorBoundary>
			<Providers>
				<Router />
			</Providers>
		</AppErrorBoundary>
	);
};

const AppErrorBoundary: Component<ParentProps> = withI18n(
	(props: ParentProps) => {
		const t = useI18n<typeof resources>();

		return (
			<ErrorBoundary
				fallback={(_err, reset) => {
					const onClickBackToHome = () => {
						reset();

						location.pathname = "/";
					};

					return (
						<>
							<Portal>
								<AlertDialog defaultOpen>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												{t("errorBoundary.title")}
											</AlertDialogTitle>
											<AlertDialogDescription>
												{t("errorBoundary.description")}
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogClose onClick={reset}>
												{t("errorBoundary.doCancel")}
											</AlertDialogClose>
											<AlertDialogAction
												onClick={onClickBackToHome}>
												{t(
													"errorBoundary.doBackToHome",
												)}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</Portal>
						</>
					);
				}}>
				{props.children}
			</ErrorBoundary>
		);
	},
);
