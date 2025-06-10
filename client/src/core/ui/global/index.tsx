import { MyPassportFormSyncLazy } from "feat/my-passport-form-sync";
import { useIsMatch as useIsMyPassportFormSyncMatch } from "feat/my-passport-form-sync/hooks/use-is-match";
import { useToaster as useMyPassportFormSyncToaster } from "feat/my-passport-form-sync/hooks/use-toaster";
import { Match, Switch } from "solid-js";
import { ToastList, ToastRegion } from "ui/toast";

export const Global = () => {
	const isMyPassportFormSyncMatch = useIsMyPassportFormSyncMatch();

	/// @ts-expect-error: in case for debugging
	const _myPassportFormSyncToaster = useMyPassportFormSyncToaster();

	return (
		<>
			<Switch>
				<Match when={isMyPassportFormSyncMatch()}>
					<MyPassportFormSyncLazy />
				</Match>
			</Switch>

			<ToastRegion>
				<ToastList />
			</ToastRegion>
		</>
	);
};
