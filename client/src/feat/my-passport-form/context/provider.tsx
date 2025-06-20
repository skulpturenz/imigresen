import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { myPassportFormService } from "feat/my-passport-form/services/my-passport-form-service";
import { createContext, type Component, type ParentProps } from "solid-js";
import { createMyPassportFormContext } from "./initializers";

export type MyPassportFormSvc = ReturnType<typeof myPassportFormService>;

export const MyPassportFormContext = createContext<MyPassportFormSvc>(
	createMyPassportFormContext(),
);

export const MyPassportFormProvider: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);

	return (
		<MyPassportFormContext.Provider
			value={myPassportFormService(authnContext().keycloak?.token)}>
			{props.children}
		</MyPassportFormContext.Provider>
	);
};
