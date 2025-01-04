import { Navigate, useLocation } from "@solidjs/router";
import { CoreRoute } from "core/constants/core-route.enum";
import { toPath } from "core/router/route";
import { Show } from "solid-js";

interface UnathorizedLocationState {
	referer: string;
}

export const Unauthorized = () => {
	const location = useLocation<UnathorizedLocationState>();

	return (
		<>
			<Show when={!location.state?.referer}>
				<Navigate href={toPath(CoreRoute.Home)} />
			</Show>

			<Show when={location.state?.referer}>Unauthorized!!</Show>
		</>
	);
};
