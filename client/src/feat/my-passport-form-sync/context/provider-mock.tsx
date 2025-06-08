import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { myPassportFormSyncServiceMock } from "feat/my-passport-form-sync/services/my-passport-form-sync-service-mock";
import { type Component, type ParentProps } from "solid-js";
import { MyPassportFormContext } from "./provider";

export const MyPassportFormSyncProviderMock: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);

	return (
		<MyPassportFormContext.Provider
			value={myPassportFormSyncServiceMock(
				authnContext().keycloak?.token,
			)}>
			{props.children}
		</MyPassportFormContext.Provider>
	);
};
