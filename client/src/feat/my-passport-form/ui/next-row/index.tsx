import { spreadProps } from "core/utils/utils";
import { constants } from "feat/my-passport-form/ui/constants";
import type { Component, JSX, ParentProps } from "solid-js";
import { cn } from "ui/utils";

export const NextRow: Component<
	ParentProps<JSX.HTMLAttributes<HTMLDivElement>>
> = props => (
	<div class="col-span-full">
		<div {...spreadProps(props)} class={cn(constants.grid)}>
			{props.children}
		</div>
	</div>
);
