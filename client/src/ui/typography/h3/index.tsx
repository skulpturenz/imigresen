import type { Component, ParentProps } from "solid-js";

export const H3: Component<ParentProps> = props => (
	<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">
		{props.children}
	</h3>
);
