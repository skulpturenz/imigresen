import { AuthRoute } from "core/constants/auth-route.enum";
import { CoreRoute } from "core/constants/core-route.enum";
import { toPath } from "core/router/route";

export const getRedirectPath = ({
	redirectPath = "",
	...rest
}: Record<string, any>) => {
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
		const url = new URL(redirectPath, window.location.origin);
		url.search = remainingSearchParams.toString();

		return toRelativeUrl(url.href);
	}

	const url = new URL(
		redirectPath ?? toPath(CoreRoute.Home),
		window.location.origin,
	);
	url.search = remainingSearchParams.toString();

	return toRelativeUrl(url.href);
};

const toRelativeUrl = (href: string) =>
	href.replace(window.location.origin, "");
