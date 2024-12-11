export const createRedirectUrl = (
	authRedirectUri: string,
	redirectPath?: string,
) => {
	const params = new URLSearchParams({
		redirectPath: redirectPath ?? "",
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
