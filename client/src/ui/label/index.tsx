import type { PolymorphicProps } from "@kobalte/core";
import { cva, type VariantProps } from "class-variance-authority";
import { spreadProps } from "core/utils";
import type { ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "ui/utils";

export const label = cva(
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

export const Label = <T extends ValidComponent = "label">(
	props: PolymorphicProps<T, VariantProps<typeof label>>,
) => (
	<Dynamic
		{...spreadProps(props)}
		ref={props.ref}
		component={props.as ?? "label"}
		class={cn(
			label({
				label: props.label,
				error: props.error,
				description: props.description,
			}),
		)}
	/>
);
