import type { Component, ParentProps } from "solid-js";

export const H2: Component<ParentProps> = props => (
	<h2 class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
		{props.children}
	</h2>
);
