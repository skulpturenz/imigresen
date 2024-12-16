import type { PolymorphicProps } from "@kobalte/core";
import {
	Dialog as DialogPrimitive,
	type DialogContentProps,
	type DialogDescriptionProps,
	type DialogOverlayProps,
	type DialogTitleProps,
} from "@kobalte/core/dialog";
import { spreadProps } from "core/utils";
import { X } from "lucide-solid";
import type { Component, ComponentProps, ValidComponent } from "solid-js";
import { cn } from "ui/utils";

const resources = {
	close: "Close",
};

export const Dialog = DialogPrimitive;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogClose = DialogPrimitive.CloseButton;

export const DialogOverlay = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DialogOverlayProps<T>>,
) => (
	<DialogPrimitive.Overlay
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"fixed inset-0 z-50 bg-black/80  data-[expanded]:animate-in data-[closed]:animate-out",
			"data-[closed]:fade-out-0 data-[expanded]:fade-in-0",
			props.class,
		)}
	/>
);

export const DialogContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DialogContentProps<T>>,
) => (
	<DialogPortal>
		<DialogOverlay />

		<DialogPrimitive.Content
			{...spreadProps(props)}
			ref={props.ref}
			class={cn(
				"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
				"border bg-background p-6 shadow-lg duration-200 data-[expanded]:animate-in data-[closed]:animate-out",
				"data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95",
				"data-[expanded]:zoom-in-95 data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-[48%]",
				"data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-[48%] sm:rounded-lg",
				props.class,
			)}>
			{props.children}

			<DialogPrimitive.CloseButton
				class={cn(
					"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity",
					"hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-shadow",
					"disabled:pointer-events-none data-[expanded]:bg-accent data-[expanded]:text-muted-foreground",
				)}>
				<X class="h-4 w-4" />

				<span class="sr-only">{resources.close}</span>
			</DialogPrimitive.CloseButton>
		</DialogPrimitive.Content>
	</DialogPortal>
);

export const DialogTitle = <T extends ValidComponent = "h2">(
	props: PolymorphicProps<T, DialogTitleProps<T>>,
) => (
	<DialogPrimitive.Title
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"text-lg font-semibold leading-none tracking-tight",
			props.class,
		)}
	/>
);

export const DialogDescription = <T extends ValidComponent = "p">(
	props: PolymorphicProps<T, DialogDescriptionProps<T>>,
) => (
	<DialogPrimitive.Description
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("text-sm text-muted-foreground", props.class)}
	/>
);

export const DialogHeader: Component<ComponentProps<"div">> = (
	props: ComponentProps<"div">,
) => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left",
			props.class,
		)}
	/>
);

export const DialogFooter: Component<ComponentProps<"div">> = props => (
	<div
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			props.class,
		)}
	/>
);
