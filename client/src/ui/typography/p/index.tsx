import type { Component, ParentProps } from "solid-js";

export const P: Component<ParentProps> = props => (
	<p class="leading-7 [&:not(:first-child)]:mt-6">{props.children}</p>
);
