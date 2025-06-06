import { spreadProps } from "core/utils/utils";
import type { Component, ComponentProps } from "solid-js";
import { cn } from "ui/utils";

export const Card: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"rounded-lg border border-border bg-card text-card-foreground shadow-sm",
			props.class,
		)}
	/>
);

export const CardHeader: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex text-card-foreground flex-col space-y-1.5 p-6",
			props.class,
		)}
	/>
);

export const CardTitle: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"text-2xl text-card-foreground font-semibold leading-none tracking-tight",
			props.class,
		)}
	/>
);

export const CardDescription: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("text-sm text-muted-foreground", props.class)}
	/>
);

export const CardContent: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("p-6 text-card-foreground pt-0", props.class)}
	/>
);

export const CardFooter: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex text-card-foreground items-center p-6 pt-0",
			props.class,
		)}
	/>
);
