import type { PolymorphicProps } from "@kobalte/core";
import { spreadProps } from "core/utils";
import { ChevronRight, MoreHorizontal } from "lucide-solid";
import type { Component, ComponentProps, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "ui/utils";

export const resources = {
	srOnly: "More",
};

export const Breadcrumb: Component<ComponentProps<"nav">> = props => (
	<nav {...spreadProps(props)} ref={props.ref} aria-label="breadcrumb" />
);

export const BreadcrumbList: Component<ComponentProps<"ol">> = props => (
	<ol
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
			props.class,
		)}
	/>
);

export const BreadcrumbItem: Component<ComponentProps<"li">> = props => (
	<li
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("inline-flex items-center gap-1.5", props.class)}
	/>
);

export const BreadcrumbLink = <T extends ValidComponent = "a">(
	props: PolymorphicProps<T>,
) => (
	<Dynamic
		{...spreadProps(props)}
		ref={props.ref}
		component={props.as || "a"}
	/>
);

export const BreadcrumbPage: Component<ComponentProps<"span">> = props => (
	<span
		{...spreadProps(props)}
		ref={props.ref}
		role="link"
		aria-disabled="true"
		aria-current="page"
		class={cn("font-normal text-foreground", props.class)}
	/>
);

export const BreadcrumbSeparator: Component<ComponentProps<"li">> = props => (
	<li
		{...spreadProps(props)}
		role="presentation"
		aria-hidden="true"
		class={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", props.class)}>
		{props.children ?? <ChevronRight />}
	</li>
);

export const BreadcrumbEllipsis: Component<ComponentProps<"span">> = props => (
	<span
		{...spreadProps(props)}
		role="presentation"
		aria-hidden="true"
		class={cn("flex h-9 w-9 items-center justify-center", props.class)}>
		<MoreHorizontal class="h-4 w-4" />
		<span class="sr-only">{resources.srOnly}</span>
	</span>
);
