import { Navigate } from "@solidjs/router";
import { CoreRoute } from "core/constants/core-route.enum";
import { toPath } from "core/router/route";
import type { Component, ParentProps } from "solid-js";

export const LoginCallback: Component<ParentProps> = () => (
	<Navigate href={toPath(CoreRoute.Home)} />
);