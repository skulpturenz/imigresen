import { spreadProps } from "core/utils";
import type { Component, ParentProps } from "solid-js";
import { cn } from "ui/utils";

export interface HideProps {
	class?: string;
	when?: boolean;
}

export const Hide: Component<ParentProps<HideProps>> = props => (
	<>
		{cn(props.when ? "hidden" : "visible", props.class)}
		<div
			{...spreadProps(props)}
			// TODO: if `props.class` is after the visibility classes, it merges incorrectly
			// joined without a space: `gap-y-8visible` instead of `gap-y-8 visible` for example
			class={cn(props.class, props.when ? "hidden" : "visible")}>
			{props.children}
		</div>
	</>
);
