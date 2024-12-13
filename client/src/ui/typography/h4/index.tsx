import type { Component, ParentProps } from "solid-js";

export const H4: Component<ParentProps> = props => (
	<h4 class="scroll-m-20 text-xl font-semibold tracking-tight">
		{props.children}
	</h4>
);
