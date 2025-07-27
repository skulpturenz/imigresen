import { createContext, type Component, type ParentProps } from "solid-js";

export type ProfileSvc = Record<string, never>;

export const ProfileContext = createContext<ProfileSvc>({});

export const ProfileProvider: Component<ParentProps> = props => {
	return (
		<ProfileContext.Provider value={{}}>
			{props.children}
		</ProfileContext.Provider>
	);
};