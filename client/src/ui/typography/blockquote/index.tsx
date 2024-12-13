import type { Component, ParentProps } from "solid-js";

export const Blockquote: Component<ParentProps> = props => (
	<blockquote class="mt-6 border-l-2 pl-6 italic">
		{props.children}
	</blockquote>
);
