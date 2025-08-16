import { FeatureToggles } from "core/constants/feature-toggles.enum";
import { AuthnContext } from "core/context/authn";
import { FliptContext } from "core/context/flipt";
import { Show, useContext } from "solid-js";
import { Home as HomeV1 } from "./home-v1";
import { Home as HomeV2 } from "./home-v2";

export const Home = () => {
	const fliptContext = useContext(FliptContext);
	const authnContext = useContext(AuthnContext);

	const isHomeV2Enabled = () =>
		fliptContext().flipt?.evaluateBoolean({
			flagKey: FeatureToggles.HomeV2,
			entityId: authnContext().userId,
			context: {},
		}).enabled;

	return (
		<>
			<Show when={isHomeV2Enabled()}>
				<HomeV2 />
			</Show>

			<Show when={!isHomeV2Enabled()}>
				<HomeV1 />
			</Show>
		</>
	);
};
