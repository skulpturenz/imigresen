import type { Component, ParentProps } from "solid-js";

export const Ul: Component<ParentProps> = props => (
	<ul class="my-6 ml-6 list-disc [&>li]:mt-2">{props.children}</ul>
);
