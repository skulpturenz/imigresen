export const createRedirectUrl = (
	authRedirectUri: string,
	redirectPath?: string,
) => {
	const getRedirectPath = (redirectPath?: string) => {
		if (!redirectPath) {
			return window.location.hash;
		}

		return [redirectPath, window.location.hash].join("");
	};

	const params = new URLSearchParams({
		...Object.fromEntries(new URLSearchParams(window.location.search)),
		redirectPath: getRedirectPath(redirectPath),
	});

	params.forEach((value, key) => {
		if (!value) {
			params.delete(key);
		}
	});

	const url = URL.parse(
		[authRedirectUri, params.toString()].filter(Boolean).join("?"),
	);

	return url ?? new URL("/", location.origin);
};
