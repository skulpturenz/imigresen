import { Navigate, useSearchParams } from "@solidjs/router";
import { AuthRoute } from "core/constants/auth-route.enum";
import { CoreRoute } from "core/constants/core-route.enum";
import { toPath } from "core/router/route";
import type { Component, ParentProps } from "solid-js";

export const LoginCallback: Component<ParentProps> = () => {
	const [searchParams] = useSearchParams<{ redirectPath: string }>();

	const getRedirectPath = () => {
		if (
			searchParams.redirectPath &&
			searchParams.redirectPath !==
				toPath(CoreRoute.Auth, AuthRoute.LoginCallback)
		) {
			return searchParams.redirectPath;
		}

		return toPath(CoreRoute.Home);
	};

	return <Navigate href={getRedirectPath()} />;
};
