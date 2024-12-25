import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { homeService } from "feat/home/services/home-service-mock";
import { type Component, type ParentProps } from "solid-js";
import { HomeContext } from "./provider";

export const HomeProviderMock: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);
	const value = homeService(authnContext().keycloak?.token);

	return (
		<HomeContext.Provider value={value}>
			{props.children}
		</HomeContext.Provider>
	);
};
