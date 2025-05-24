import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { myPassportFormService } from "feat/my-passport-form/services/my-passport-form-service-mock";
import { type Component, type ParentProps } from "solid-js";
import { MyPassportFormContext } from "./provider";

export const MyPassportFormProviderMock: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);
	const value = myPassportFormService(authnContext().keycloak?.token);

	return (
		<MyPassportFormContext.Provider value={value}>
			{props.children}
		</MyPassportFormContext.Provider>
	);
};
