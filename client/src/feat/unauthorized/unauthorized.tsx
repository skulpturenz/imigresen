import { Navigate, useLocation } from "@solidjs/router";
import { CoreRoute } from "core/constants/core-route.enum";
import { toPath } from "core/router/route";
import { Show } from "solid-js";

interface UnathorizedLocationState {
	from: string;
}

export const Unauthorized = () => {
	const location = useLocation<UnathorizedLocationState>();

	return (
		<>
			<Show when={!location.state}>
				<Navigate href={toPath(CoreRoute.Home)} />
			</Show>

			<Show when={location.state}>Unauthorized!!</Show>
		</>
	);
};
