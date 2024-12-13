import type { Component, ParentProps } from "solid-js";

export const H1: Component<ParentProps> = props => (
	<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
		{props.children}
	</h1>
);
