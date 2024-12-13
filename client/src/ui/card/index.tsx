import { spreadProps } from "core/utils";
import type { Component, ComponentProps } from "solid-js";
import { cn } from "ui/utils";

export const Card: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"rounded-lg border bg-card text-card-foreground shadow-sm",
			props.class,
		)}
	/>
);

export const CardHeader: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("flex flex-col space-y-1.5 p-6", props.class)}
	/>
);

export const CardTitle: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"text-2xl font-semibold leading-none tracking-tight",
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
		class={cn("p-6 pt-0", props.class)}
	/>
);

export const CardFooter: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("flex items-center p-6 pt-0", props.class)}
	/>
);
