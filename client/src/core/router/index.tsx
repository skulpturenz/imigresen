import { Router as SolidRouter } from "@solidjs/router";
import { useI18n } from "core/context/i18n";
import { Router as AuthRouter } from "feat/auth";
import { Router as HomeRouter } from "feat/home";
import { Router as NotFoundRouter } from "feat/not-found";
import { Router as UnauthorizedRouter } from "feat/unauthorized";
import { ErrorBoundary, type Component, type ParentProps } from "solid-js";
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

export type RouterProps = Record<string, unknown>;

export const Router = () => {
	return (
		<RouterErrorBoundary>
			<SolidRouter>
				<AuthRouter />
				<HomeRouter />
				<UnauthorizedRouter />
				<NotFoundRouter />
			</SolidRouter>
		</RouterErrorBoundary>
	);
};

const RouterErrorBoundary: Component<ParentProps> = props => (
	<ErrorBoundary
		fallback={(_err, reset) => {
			const Fallback = withI18n(() => {
				const t = useI18n<typeof resources>();

				const onClickCancel = reset;
				const onClickBackToHome = () => {
					reset();

					location.pathname = "/";
				};

				return (
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
								<AlertDialogClose onClick={onClickCancel}>
									{t("errorBoundary.doCancel")}
								</AlertDialogClose>
								<AlertDialogAction onClick={onClickBackToHome}>
									{t("errorBoundary.doBackToHome")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				);
			});

			return <Fallback />;
		}}>
		{props.children}
	</ErrorBoundary>
);
