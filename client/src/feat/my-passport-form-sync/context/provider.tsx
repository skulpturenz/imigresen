import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { myPassportFormSyncService } from "feat/my-passport-form-sync/services/my-passport-form-sync-service";
import { createContext, type Component, type ParentProps } from "solid-js";
import { createMyPassportFormSyncContext } from "./initializers";

export type MyPassportFormSyncSvc = ReturnType<
	typeof myPassportFormSyncService
>;

export const MyPassportFormContext = createContext<MyPassportFormSyncSvc>(
	createMyPassportFormSyncContext(),
);

export const MyPassportFormSyncProvider: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);

	return (
		<MyPassportFormContext.Provider
			value={myPassportFormSyncService(authnContext().keycloak?.token)}>
			{props.children}
		</MyPassportFormContext.Provider>
	);
};
