import { spreadProps } from "core/utils";
import type { Component, ParentProps } from "solid-js";
import { cn } from "ui/utils";

export interface HideProps {
	class?: string;
	when?: boolean;
}

export const Hide: Component<ParentProps<HideProps>> = props => (
	<div
		{...spreadProps(props)}
		class={cn(props.when ? "hidden" : "visible", props.class)}>
		{props.children}
	</div>
);
