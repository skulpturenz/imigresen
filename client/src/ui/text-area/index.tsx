import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import {
	type TextFieldTextAreaProps,
	TextArea as TextFieldPrimitive,
} from "@kobalte/core/text-field";
import { spreadProps } from "core/utils";
import type { ValidComponent } from "solid-js";
import { cn } from "ui/utils";

export const TextAreaRoot = TextFieldPrimitive;

export const TextArea = <T extends ValidComponent = "textarea">(
	props: PolymorphicProps<T, TextFieldTextAreaProps<T>>,
) => (
	<TextFieldPrimitive
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex min-h-[80px] w-full rounded-md border border-input focus:border-input bg-background px-3 py-2 text-base",
			"ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
			"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed",
			"disabled:opacity-50 md:text-sm transition-shadow",
			"data-[invalid]:animate-headShake disabled:data-[invalid]:animate-none data-[invalid]:border-destructive",
			"data-[invalid]:text-destructive data-[invalid]:border data-[invalid]:placeholder-destructive",
			props.class,
		)}
	/>
);
