import type { Component, ParentProps } from "solid-js";

export const InputGroup: Component<ParentProps> = props => (
	<div class="flex flex-col space-y-4">{props.children}</div>
);
