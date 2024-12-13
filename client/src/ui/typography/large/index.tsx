import type { Component, ParentProps } from "solid-js";

export const Large: Component<ParentProps> = props => (
	<div class="text-lg font-semibold">{props.children}</div>
);
