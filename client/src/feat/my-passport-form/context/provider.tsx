import { createContext, type Component, type ParentProps } from "solid-js";
import { createMyPassportFormContext } from "./initializers";

export interface MyPassportFormSvc {}

export const MyPassportFormContext = createContext<MyPassportFormSvc>(
	createMyPassportFormContext(),
);

export const MyPassportFormProvider: Component<ParentProps> = props => {
	return (
		<MyPassportFormContext.Provider value={Object.create(null)}>
			{props.children}
		</MyPassportFormContext.Provider>
	);
};
