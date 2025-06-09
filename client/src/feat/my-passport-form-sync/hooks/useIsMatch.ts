import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";

export const useIsMatch = () => {
	const authnContext = useContext(AuthnContext);
	const userContext = useContext(UserContext);
	const searchParams = new URLSearchParams(window.location.search);

	const isMatch = () =>
		true || // TODO
		(Boolean(authnContext().keycloak?.token) &&
			userContext().syncComplete &&
			!searchParams.has("view", "sync"));

	return isMatch;
};
