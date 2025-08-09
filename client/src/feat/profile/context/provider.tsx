import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { profileService } from "feat/profile/services/profile-service";
import { createContext, type Component, type ParentProps } from "solid-js";
import { createProfileContext } from "./initializers";

export type ProfileSvc = ReturnType<typeof profileService>;

export const ProfileContext = createContext<ProfileSvc>(createProfileContext());

export const ProfileProvider: Component<ParentProps> = props => {
	const authnContext = useContext(AuthnContext);

	return (
		<ProfileContext.Provider
			value={profileService(authnContext().keycloak?.token)}>
			{props.children}
		</ProfileContext.Provider>
	);
};
