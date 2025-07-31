import { default as formbricks } from "@formbricks/js";
import { I18nProvider } from "@kobalte/core/i18n";
import { AuthnContext } from "core/context/authn";
import { createUiContext } from "core/context/initializers";
import { useContext } from "core/context/utils";
import { assertEnv } from "core/utils/assert-env";
import { RepoContext } from "solid-automerge";
import {
	createContext,
	createEffect,
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { ToastList, ToastRegion } from "ui/toast";
import { network, repo } from "./automerge";
import { useStore, type UiSvc } from "./store";

assertEnv(
	import.meta.env.VITE_FORMBRICKS_ENVIRONMENT,
	"Formbricks environment is not specified",
);

export const UiContext = createContext<Accessor<UiSvc>>(createUiContext);

export const UiProvider: Component<ParentProps> = props => {
	const value = useStore();
	const authnContext = useContext(AuthnContext);

	createEffect(() => {
		if (value().isInitialLoading()) {
			return;
		}

		if (!import.meta.env.SSR) {
			const root = window.document.documentElement;

			root.classList.remove("light", "dark");

			if (value().theme === "system") {
				const systemTheme = window.matchMedia(
					"(prefers-color-scheme: dark)",
				).matches
					? "dark"
					: "light";

				root.classList.add(systemTheme);

				return;
			}

			root.classList.add(value().theme);
		}
	});

	onMount(() => {
		value().actions.init();

		if (!authnContext().keycloak?.authenticated) {
			return;
		}

		repo.networkSubsystem.addNetworkAdapter(network);
	});

	onMount(() => {
		const appUrl = new URL("https://app.formbricks.com");
		const searchParams = new URLSearchParams({
			formbricksDebug: import.meta.env.DEV.toString(),
		});
		appUrl.search = searchParams.toString();

		const initFormbricks = async () => {
			await formbricks.setup({
				environmentId: import.meta.env.VITE_FORMBRICKS_ENVIRONMENT,
				appUrl: appUrl.href,
			});

			await formbricks.logout().catch(console.error);
			await formbricks.setUserId(authnContext().userId);
		};

		initFormbricks();
	});

	return (
		<UiContext.Provider value={value}>
			<Show when={!value().isInitialLoading()}>
				<RepoContext.Provider value={repo}>
					<I18nProvider locale={value().locale}>
						{props.children}

						<ToastRegion>
							<ToastList />
						</ToastRegion>
					</I18nProvider>
				</RepoContext.Provider>
			</Show>
		</UiContext.Provider>
	);
};
