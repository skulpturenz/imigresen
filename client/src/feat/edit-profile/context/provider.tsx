import { createContext, type Component, type ParentProps } from "solid-js";

export type EditProfileSvc = Record<string, never>;

export const EditProfileContext = createContext<EditProfileSvc>({});

export const EditProfileProvider: Component<ParentProps> = props => {
	return (
		<EditProfileContext.Provider value={{}}>
			{props.children}
		</EditProfileContext.Provider>
	);
};