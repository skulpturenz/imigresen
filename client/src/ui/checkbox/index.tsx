import {
	type CheckboxControlProps,
	type CheckboxErrorMessageProps,
	Checkbox as CheckboxPrimitive,
	type CheckboxRootProps,
} from "@kobalte/core/checkbox";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { spreadProps } from "core/utils";
import { Check } from "lucide-solid";
import type { JSX, ParentProps, ValidComponent } from "solid-js";
import { label } from "ui/label";
import { cn } from "ui/utils";

const resources = {
	srOnly: "Checkbox",
};

export const CheckboxLabel = CheckboxPrimitive.Label;

export const Checkbox = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, CheckboxRootProps<T>>,
) => {
	return (
		<CheckboxPrimitive
			{...spreadProps(props)}
			class={cn("flex flex-col space-y-4", props.class)}>
			{props.children}
		</CheckboxPrimitive>
	);
};

export const CheckboxErrorMessage = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, CheckboxErrorMessageProps<T>>,
) => {
	return (
		<CheckboxPrimitive.ErrorMessage
			{...spreadProps(props)}
			class={cn(label({ error: true }), props.class)}>
			{props.children}
		</CheckboxPrimitive.ErrorMessage>
	);
};

export const CheckboxDescription = CheckboxPrimitive.Description;

export const CheckboxControl = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, CheckboxControlProps<T>>,
) => (
	<>
		<CheckboxPrimitive.Input
			class={cn(
				"[&:focus-visible+div]:outline-none [&:focus-visible+div]:ring-2 [&:focus-visible+div]:ring-ring",
				"[&:focus-visible+div]:ring-offset-2 [&:focus-visible+div]:ring-offset-background",
			)}
		/>
		<CheckboxPrimitive.Control
			{...spreadProps(props)}
			class={cn(
				"h-4 w-4 shrink-0 rounded-sm border border-primary shadow transition-shadow focus-visible:outline-none",
				"focus-visible:ring-2 focus-visible:ring-ring data-[disabled]:cursor-not-allowed focus-visible:ring-offset-transparent",
				"data-[checked]:bg-primary data-[checked]:text-primary-foreground data-[disabled]:opacity-50",
				props.class,
			)}>
			<CheckboxPrimitive.Indicator class="flex items-center justify-center text-current">
				<Check class="h-4 w-4" />
				<span class="sr-only">{resources.srOnly}</span>
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Control>
	</>
);

export const CheckboxInputGroup = (
	props: ParentProps<JSX.HTMLAttributes<HTMLDivElement>>,
) => (
	<div
		{...spreadProps(props)}
		class={cn("flex items-center gap-4", props.class)}
	/>
);
