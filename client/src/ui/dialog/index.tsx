import type { PolymorphicProps } from "@kobalte/core";
import {
	Dialog as DialogPrimitive,
	type DialogContentProps,
	type DialogOverlayProps,
} from "@kobalte/core/dialog";
import { spreadProps } from "core/utils";
import { X } from "lucide-solid";
import type { ValidComponent } from "solid-js";
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
			"fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out",
			"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			props.class,
		)}
	/>
);

export const DialogContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DialogContentProps<T>>,
) => (
	<DialogPrimitive.Content
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
			"border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
			"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95",
			"data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
			"data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
			props.class,
		)}>
		{props.children}

		<DialogPrimitive.CloseButton
			class={cn(
				"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity",
				"hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
				"disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
			)}>
			<X class="h-4 w-4" />

			<span class="sr-only">{resources.close}</span>
		</DialogPrimitive.CloseButton>
	</DialogPrimitive.Content>
);
