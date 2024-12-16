import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { spreadProps } from "core/utils";
import { type ComponentProps } from "solid-js";
import { cn } from "ui/utils";

export const badgeVariants = cva(
	[
		"inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
		"transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-shadow focus:ring-offset-background",
	].join(" "),
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				outline: "text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export const Badge = (
	props: ComponentProps<"div"> & VariantProps<typeof badgeVariants>,
) => (
	<div
		{...spreadProps(props)}
		class={cn(
			badgeVariants({
				variant: props.variant,
			}),
			props.class,
		)}
	/>
);
