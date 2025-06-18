import { useLocale } from "@kobalte/core";
import { FeatureToggles } from "core/constants/feature-toggles.enum";
import { styles } from "core/constants/styles";
import { AuthnContext } from "core/context/authn";
/* eslint-disable-next-line */
import { FliptContext } from "core/context/flipt";
import { useContext } from "core/context/utils";
import { Show, type Component, type ParentProps } from "solid-js";
import { cn } from "ui/utils";
import { Navbar } from "./navbar";

export const Shell: Component<ParentProps> = props => {
	const { locale, direction } = useLocale();

	const fliptContext = useContext(FliptContext);
	const authnContext = useContext(AuthnContext);

	const isHomeV2Enabled = () =>
		fliptContext().flipt?.evaluateBoolean({
			flagKey: FeatureToggles.HomeV2,
			entityId: authnContext().userId,
			context: {
				environment: import.meta.env.MODE,
			},
		}).enabled;

	return (
		<div lang={locale()} dir={direction()}>
			<Show when={!isHomeV2Enabled()}>
				<Navbar />
			</Show>

			<div class="my-14 md:my-20">
				<div class={cn(styles.contentContainer)}>
					<div class={cn(styles.narrowContentContainer)}>
						{props.children}
					</div>
				</div>
			</div>
		</div>
	);
};
