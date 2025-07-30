import { AuthContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { profileService } from "feat/profile/services/profile-service-mock";
import { type Component, type ParentProps } from "solid-js";
import { ProfileContext } from "./provider";

export const ProfileProviderMock: Component<ParentProps> = props => {
	const authContext = useContext(AuthContext);

	return (
		<ProfileContext.Provider
			value={profileService(authContext().token)}>
			{props.children}
		</ProfileContext.Provider>
	);
};
