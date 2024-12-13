import type { Component, ParentProps } from "solid-js";

export const Small: Component<ParentProps> = props => (
	<small class="text-sm font-medium leading-none">{props.children}</small>
);
