import { type Component, type ParentProps } from "solid-js";
import { EditProfileContext } from "./provider";

export const EditProfileProviderMock: Component<ParentProps> = props => {
	return (
		<EditProfileContext.Provider value={{}}>
			{props.children}
		</EditProfileContext.Provider>
	);
};