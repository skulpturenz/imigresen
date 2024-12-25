import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { homeService } from "feat/home/services/home-service";
import { createContext, type Component, type ParentProps } from "solid-js";
import { createHomeContext } from "./initializers";

export type HomeSvc = ReturnType<typeof homeService>;

export const HomeContext = createContext<HomeSvc>(createHomeContext());

export const HomeProvider: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);
	const value = homeService(authnContext().keycloak?.token);

	return (
		<HomeContext.Provider value={value}>
			{props.children}
		</HomeContext.Provider>
	);
};
