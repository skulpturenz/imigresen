import {
	type ImageFallbackProps,
	type ImageImgProps,
	type ImageRootProps,
	Image as ImagePrimitive,
} from "@kobalte/core/image";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { spreadProps } from "core/utils";
import type { ValidComponent } from "solid-js";
import { cn } from "ui/utils";

export const AvatarRoot = <T extends ValidComponent = "span">(
	props: PolymorphicProps<T, ImageRootProps<T>>,
) => (
	<ImagePrimitive
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
			props.class,
		)}
	/>
);

export const AvatarImage = <T extends ValidComponent = "img">(
	props: PolymorphicProps<T, ImageImgProps<T>>,
) => (
	<ImagePrimitive.Img
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("aspect-square h-full w-full", props.class)}
	/>
);

export const AvatarFallback = <T extends ValidComponent = "span">(
	props: PolymorphicProps<T, ImageFallbackProps<T>>,
) => (
	<ImagePrimitive.Fallback
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex h-full w-full items-center justify-center rounded-full bg-muted",
			props.class,
		)}
	/>
);
