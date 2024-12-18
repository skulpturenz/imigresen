import {
	type AlertRootProps,
	Alert as AlertPrimitive,
} from "@kobalte/core/alert";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { cva } from "class-variance-authority";
import { spreadProps } from "core/utils";
import type { ComponentProps, ValidComponent } from "solid-js";
import { cn } from "ui/utils";

export const alertVariants = cva(
	[
		"relative w-full rounded-lg border px-4 py-3 text-sm [&:has(svg)]:pl-11 [&>svg+div]:translate-y-[-3px]",
		"[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
	].join(" "),
	{
		variants: {
			variant: {
				default: "bg-background text-foreground",
				destructive:
					"border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export const Alert = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, AlertRootProps<T>>,
) => (
	<AlertPrimitive
		{...spreadProps(props)}
		class={cn(
			alertVariants({
				variant: props.variant,
			}),
			props.class,
		)}
	/>
);

export const AlertTitle = (props: ComponentProps<"div">) => (
	<div
		{...spreadProps(props)}
		class={cn("font-medium leading-5 tracking-tight", props.class)}
	/>
);

export const AlertDescription = (props: ComponentProps<"div">) => (
	<div
		{...spreadProps(props)}
		class={cn("text-sm [&_p]:leading-relaxed", props.class)}
	/>
);
