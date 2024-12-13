import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type {
	TextFieldDescriptionProps,
	TextFieldErrorMessageProps,
	TextFieldInputProps,
	TextFieldLabelProps,
	TextFieldRootProps,
} from "@kobalte/core/text-field";
import { TextField as TextFieldPrimitive } from "@kobalte/core/text-field";
import { cva } from "class-variance-authority";
import { spreadProps } from "core/utils";
import type { ValidComponent } from "solid-js";
import { cn } from "ui/utils";

export const TextFieldRoot = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldRootProps<T>>,
) => (
	<TextFieldPrimitive
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("space-y-1", props.class)}
	/>
);

export const textfieldLabel = cva(
	"text-base sm:text-sm font-medium leading-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
	{
		variants: {
			label: {
				true: "data-[invalid]:text-destructive",
			},
			error: {
				true: "text-destructive",
			},
			description: {
				true: "font-normal text-muted-foreground",
			},
		},
		defaultVariants: {
			label: true,
		},
	},
);

export const TextFieldLabel = <T extends ValidComponent = "label">(
	props: PolymorphicProps<T, TextFieldLabelProps<T>>,
) => (
	<TextFieldPrimitive.Label
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(textfieldLabel(), props.class)}
	/>
);

export const TextFieldErrorMessage = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldErrorMessageProps<T>>,
) => (
	<TextFieldPrimitive.ErrorMessage
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(textfieldLabel({ error: true }), props.class)}
	/>
);

export const TextFieldDescription = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldDescriptionProps<T>>,
) => (
	<TextFieldPrimitive.Description
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			textfieldLabel({ description: true, label: false }),
			props.class,
		)}
	/>
);

export const TextField = <T extends ValidComponent = "input">(
	props: PolymorphicProps<T, TextFieldInputProps<T>>,
) => (
	<TextFieldPrimitive.Input
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex h-10 w-full rounded-md border border-input focus:border-input bg-background px-3 py-2 text-base",
			"ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
			"file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
			"focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			"data-[invalid]:animate-headShake data-[invalid]:border-destructive data-[invalid]:text-destructive",
			"data-[invalid]:border data-[invalid]:placeholder-destructive",
			props.class,
		)}
	/>
);
