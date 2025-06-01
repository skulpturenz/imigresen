import { Navigate, useSearchParams } from "@solidjs/router";
import { AuthRoute } from "core/constants/auth-route.enum";
import { CoreRoute } from "core/constants/core-route.enum";
import { toPath } from "core/router/route";
import type { Component, ParentProps } from "solid-js";

export const LoginCallback: Component<ParentProps> = () => {
	const [searchParams] = useSearchParams<{ redirectPath: string }>();

	const getRedirectPath = () => {
		const { redirectPath, ...rest } = searchParams;
		const remainingSearchParams = new URLSearchParams(rest);

		remainingSearchParams.forEach((value, key) => {
			if (!value) {
				remainingSearchParams.delete(key);
			}
		});

		if (
			redirectPath &&
			redirectPath !== toPath(CoreRoute.Auth, AuthRoute.LoginCallback)
		) {
			return [redirectPath, remainingSearchParams.toString()].join("?");
		}

		return [toPath(CoreRoute.Home), remainingSearchParams.toString()].join(
			"?",
		);
	};

	return <Navigate href={getRedirectPath()} />;
};
