import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";

export const useIsMatch = () => {
	const authnContext = useContext(AuthnContext);

	const isMatch = () => Boolean(authnContext().keycloak?.token);

	return isMatch;
};
