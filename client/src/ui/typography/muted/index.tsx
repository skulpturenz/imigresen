import type { Component, ParentProps } from "solid-js";

export const Muted: Component<ParentProps> = props => (
	<p class="text-sm text-muted-foreground">{props.children}</p>
);
