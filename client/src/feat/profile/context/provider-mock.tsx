import { type Component, type ParentProps } from "solid-js";
import { ProfileContext } from "./provider";

export const ProfileProviderMock: Component<ParentProps> = props => {
	return (
		<ProfileContext.Provider value={{}}>
			{props.children}
		</ProfileContext.Provider>
	);
};
