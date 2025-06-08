import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { myPassportFormSyncService } from "feat/my-passport-form-sync/services/my-passport-form-sync-service";
import { createContext, type Component, type ParentProps } from "solid-js";
import { createMyPassportFormSyncContext } from "./initializers";

export type MyPassportFormSyncSvc = ReturnType<
	typeof myPassportFormSyncService
>;

export const MyPassportFormSyncContext = createContext<MyPassportFormSyncSvc>(
	createMyPassportFormSyncContext(),
);

export const MyPassportFormSyncProvider: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);

	return (
		<MyPassportFormSyncContext.Provider
			value={myPassportFormSyncService(authnContext().keycloak?.token)}>
			{props.children}
		</MyPassportFormSyncContext.Provider>
	);
};
