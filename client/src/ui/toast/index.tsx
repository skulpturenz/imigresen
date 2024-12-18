import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import {
	Toast as ToastPrimitive,
	type ToastDescriptionProps,
	type ToastListProps,
	type ToastRegionProps,
	type ToastRootProps,
	type ToastTitleProps,
} from "@kobalte/core/toast";
import { cva } from "class-variance-authority";
import { spreadProps } from "core/utils";
import { X } from "lucide-solid";
import {
	mergeProps,
	type ComponentProps,
	type ValidComponent,
	type VoidComponent,
} from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "ui/utils";

const resources = {
	srOnly: "Close",
};

export const toastVariants = cva(
	[
		"group pointer-events-auto relative flex flex-col gap-3 w-full items-center justify-between overflow-hidden",
		"rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-y-0",
		"data-[swipe=end]:translate-y-[var(--kb-toast-swipe-end-y)] data-[swipe=move]:translate-y-[--kb-toast-swipe-move-y]",
		"data-[swipe=move]:transition-none data-[opened]:animate-in data-[closed]:animate-out",
		"data-[swipe=end]:animate-out data-[closed]:fade-out-80 data-[closed]:slide-out-to-top-full",
		"data-[closed]:sm:slide-out-to-bottom-full data-[opened]:slide-in-from-top-full data-[opened]:sm:slide-in-from-bottom-full",
	].join(" "),
	{
		variants: {
			variant: {
				default: "border bg-background",
				destructive:
					"destructive group border-destructive bg-destructive text-destructive-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export const ToastRoot = () => (
	<Portal>
		<ToastPrimitive.Region>
			<ToastPrimitive.List class="toast__list" />
		</ToastPrimitive.Region>
	</Portal>
);

export const Toast = <T extends ValidComponent = "li">(
	props: PolymorphicProps<T, ToastRootProps<T>>,
) => (
	<ToastPrimitive
		{...spreadProps(props)}
		class={cn(toastVariants({ variant: props.variant }), props.class)}
	/>
);

export const ToastTitle = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, ToastTitleProps<T>>,
) => (
	<ToastPrimitive.Title
		{...spreadProps(props)}
		class={cn("text-sm font-semibold [&+div]:text-xs", props.class)}
	/>
);

export const ToastDescription = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, ToastDescriptionProps<T>>,
) => (
	<ToastPrimitive.Description
		{...spreadProps(props)}
		class={cn("text-sm opacity-90", props.class)}
	/>
);

export const ToastRegion = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, ToastRegionProps<T>>,
) => (
	<Portal>
		<ToastPrimitive.Region
			{...mergeProps<ToastRegionProps[]>(
				{
					swipeDirection: "down",
				},
				props,
			)}
		/>
	</Portal>
);

export const ToastList = <T extends ValidComponent = "ol">(
	props: PolymorphicProps<T, ToastListProps<T>>,
) => (
	<ToastPrimitive.List
		{...spreadProps(cn)}
		class={cn(
			"fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto",
			"sm:flex-col md:max-w-[420px]",
			props.class,
		)}
	/>
);

export const ToastContent = (props: ComponentProps<"div">) => (
	<div
		{...spreadProps(props)}
		class={cn("flex w-full flex-col", props.class)}>
		<div>{props.children}</div>
		<ToastPrimitive.CloseButton
			class={cn(
				"absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground",
				"focus:opacity-100 focus:outline-none group-hover:opacity-100 group-[.destructive]:text-red-300",
				"group-[.destructive]:hover:text-red-50",
			)}>
			<X class="h-4 w-4">
				<span class="sr-only">{resources.srOnly}</span>
			</X>
		</ToastPrimitive.CloseButton>
	</div>
);

export const ToastProgress: VoidComponent = () => (
	<ToastPrimitive.ProgressTrack class="h-1 w-full overflow-hidden rounded-xl bg-primary/20 group-[.destructive]:bg-background/20">
		<ToastPrimitive.ProgressFill
			class={cn(
				"h-full w-[--kb-toast-progress-fill-width] bg-primary transition-all duration-150 ease-linear",
				"group-[.destructive]:bg-destructive-foreground",
			)}
		/>
	</ToastPrimitive.ProgressTrack>
);
