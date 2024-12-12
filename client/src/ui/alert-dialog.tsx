import type { PolymorphicProps } from "@kobalte/core";
import {
	AlertDialog as AlertDialogPrimitive,
	type AlertDialogContentProps,
} from "@kobalte/core/alert-dialog";
import type {
	DialogCloseButtonProps,
	DialogDescriptionProps,
	DialogOverlayProps,
	DialogTitleProps,
} from "@kobalte/core/dialog";
import { spreadProps } from "core/utils";
import type { Component, ComponentProps, ValidComponent } from "solid-js";
import { buttonVariants } from "./button";
import { cn } from "./utils";

export const AlertDialog = AlertDialogPrimitive;

export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export const AlertDialogPortal = AlertDialogPrimitive.Portal;

export const AlertDialogOverlay = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DialogOverlayProps<T>>,
) => (
	<AlertDialogPrimitive.Overlay
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"fixed inset-0 z-50 bg-black/80  data-[expanded]:animate-in data-[closed]:animate-out",
			"data-[closed]:fade-out-0 data-[expanded]:fade-in-0",
			props.class,
		)}
	/>
);

export const AlertDialogContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, AlertDialogContentProps<T>>,
) => (
	<AlertDialogPortal>
		<AlertDialogOverlay />

		<AlertDialogPrimitive.Content
			{...spreadProps(props)}
			ref={props.ref}
			className={cn(
				"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%]",
				"translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
				"data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0",
				"data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
				"data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-[48%]",
				"data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-[48%] sm:rounded-lg",
				props.class,
			)}
		/>
	</AlertDialogPortal>
);

export const AlertDialogHeader: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex flex-col space-y-2 text-center sm:text-left",
			props.class,
		)}
	/>
);

export const AlertDialogFooter: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			props.class,
		)}
	/>
);

export const AlertDialogTitle = <T extends ValidComponent = "h2">(
	props: PolymorphicProps<T, DialogTitleProps<T>>,
) => (
	<AlertDialogPrimitive.Title
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("text-lg font-semibold", props.class)}
	/>
);

export const AlertDialogDescription = <T extends ValidComponent = "p">(
	props: PolymorphicProps<T, DialogDescriptionProps<T>>,
) => (
	<AlertDialogPrimitive.Description
		{...spreadProps(props)}
		ref={props.ref}
		className={cn("text-sm text-muted-foreground", props.class)}
	/>
);

export const AlertDialogClose = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, DialogCloseButtonProps<T>>,
) => (
	<AlertDialogPrimitive.CloseButton
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			buttonVariants({
				variant: "outline",
			}),
			"mt-2 md:mt-0",
			props.class,
		)}
	/>
);

export const AlertDialogAction = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, DialogCloseButtonProps<T>>,
) => (
	<AlertDialogPrimitive.CloseButton
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(buttonVariants(), props.class)}
	/>
);
