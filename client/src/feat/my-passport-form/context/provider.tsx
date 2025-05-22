import { AuthnContext } from "core/context/authn";
import { myPassportFormAutomergeRepo } from "feat/my-passport-form/services/my-passport-form-service";
import {
	createContext,
	useContext,
	type Component,
	type ParentProps,
} from "solid-js";
import { createMyPassportFormContext } from "./initializers";

export interface MyPassportFormSvc {
	automergeRepo: ReturnType<typeof myPassportFormAutomergeRepo>;
}

export const MyPassportFormContext = createContext<MyPassportFormSvc>(
	createMyPassportFormContext(),
);

export const MyPassportFormProvider: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);

	const automergeRepo = myPassportFormAutomergeRepo(
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
