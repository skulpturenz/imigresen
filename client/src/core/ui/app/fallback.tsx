import { useI18n } from "core/context/i18n";
import type { Component, ParentProps } from "solid-js";
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

export interface FallbackProps {
	err: any;
	reset: () => void;
}

export const Fallback: Component<ParentProps<FallbackProps>> = withI18n(
	props => {
		const t = useI18n<typeof resources>();

		const onClickCancel = () => props.reset();
		const onClickBackToHome = () => {
			props.reset();

			location.pathname = "/";
		};

		if (import.meta.env.DEV) {
			console.error(props.err);
		}

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
	},
);
