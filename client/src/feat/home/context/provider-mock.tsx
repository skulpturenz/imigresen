import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { homeService } from "feat/home/services/home-service-mock";
import { useRepo } from "solid-automerge";
import { type Component, type ParentProps } from "solid-js";
import { HomeContext } from "./provider";

export const HomeProviderMock: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);
	const repo = useRepo();

	return (
		<HomeContext.Provider
			value={homeService(repo, authnContext().keycloak?.token)}>
			{props.children}
		</HomeContext.Provider>
	);
};
