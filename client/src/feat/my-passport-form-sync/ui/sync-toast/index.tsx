import { useI18n } from "core/context/i18n";
import { withI18n } from "feat/my-passport-form-sync/resources";
import type { resources } from "feat/my-passport-form-sync/resources/i18n/en-us";
import { type Component, type ParentProps } from "solid-js";
import { Toast, ToastContent, ToastDescription, ToastTitle } from "ui/toast";

export interface SyncToast {
	toastId: number;
	numberOfApplications: number;
}

export const SyncToast: Component<ParentProps<SyncToast>> = withI18n(props => {
	const t = useI18n<typeof resources>();

	return (
		<Toast toastId={props.toastId}>
			<ToastContent>
				<ToastTitle>{t("toastTitle")}</ToastTitle>

				<ToastDescription>
					{t("toastDescription", props.numberOfApplications)}
				</ToastDescription>
			</ToastContent>
		</Toast>
	);
});
