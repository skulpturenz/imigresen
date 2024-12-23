import type { Component, ParentProps } from "solid-js";

export const UserProviderMock: Component<ParentProps> = props => (
	<>{props.children}</>
);
