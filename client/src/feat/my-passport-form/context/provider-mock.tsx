import { AuthnContext } from "core/context/authn";
import { myPassportFormAutomergeRepoMock } from "feat/my-passport-form/services/my-passport-form-service-mock";
import { useContext, type Component, type ParentProps } from "solid-js";
import { MyPassportFormContext } from "./provider";

export const MyPassportFormProviderMock: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);

	const automergeRepo = myPassportFormAutomergeRepoMock(
		authnContext().keycloak?.token,
	);

	const value = {
		automergeRepo,
	};

	return (
		<MyPassportFormContext.Provider value={value}>
			{props.children}
		</MyPassportFormContext.Provider>
	);
};
