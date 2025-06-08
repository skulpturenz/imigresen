import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";

export const useIsMatch = () => {
	const authnContext = useContext(AuthnContext);
	const userContext = useContext(UserContext);

	const isMatch = () =>
		Boolean(authnContext().keycloak?.token) && userContext().syncComplete;

	return isMatch;
};
