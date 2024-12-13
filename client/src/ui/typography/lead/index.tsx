import type { Component, ParentProps } from "solid-js";

export const Lead: Component<ParentProps> = props => (
	<p class="text-xl text-muted-foreground">{props.children}</p>
);
