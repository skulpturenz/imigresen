import { type Component, type ParentProps } from "solid-js";
import { MyPassportFormContext } from "./provider";

export const MyPassportFormProviderMock: Component<ParentProps> = props => {
	return (
		<MyPassportFormContext.Provider value={Object.create(null)}>
			{props.children}
		</MyPassportFormContext.Provider>
	);
};
