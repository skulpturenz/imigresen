import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import {
	type TooltipContentProps,
	Tooltip as TooltipPrimitive,
	type TooltipRootProps,
} from "@kobalte/core/tooltip";
import { spreadProps } from "core/utils";
import { type ValidComponent, mergeProps } from "solid-js";
import { cn } from "ui/utils";

export const TooltipTrigger = TooltipPrimitive.Trigger;

export const Tooltip = (props: TooltipRootProps) => (
	<TooltipPrimitive
		{...mergeProps<TooltipRootProps[]>(
			{
				gutter: 4,
				flip: false,
			},
			props,
		)}
	/>
);

export const TooltipContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TooltipContentProps<T>>,
) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			{...spreadProps(props)}
			class={cn(
				"z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
				"data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0",
				"data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
				props.class,
			)}
			ref={props.ref}
		/>
	</TooltipPrimitive.Portal>
);
