import { MyPassportFormSyncLazy } from "feat/my-passport-form-sync";
import { useIsMatch as useIsMyPassportFormSyncMatch } from "feat/my-passport-form-sync/hooks/useIsMatch";
import { Match, Switch } from "solid-js";

export const Global = () => {
	const isMyPassportFormSyncMatch = useIsMyPassportFormSyncMatch();

	return (
		<>
			<Switch>
				<Match when={isMyPassportFormSyncMatch()}>
					<MyPassportFormSyncLazy />
				</Match>
			</Switch>
		</>
	);
};
