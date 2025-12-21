import {
	Checkbox as CheckboxPrimitive,
	type CheckboxErrorMessageProps,
	type CheckboxRootProps,
	type CheckboxControlProps as KBCheckboxControlProps,
} from "@kobalte/core/checkbox";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { spreadProps } from "core/utils";
import { Check } from "lucide-solid";
import {
	splitProps,
	type JSX,
	type ParentProps,
	type ValidComponent,
} from "solid-js";
import { label } from "ui/label";
import { cn } from "ui/utils";

const resources = {
	srOnly: "Checkbox",
};

export const CheckboxLabel = CheckboxPrimitive.Label;

interface CheckboxProps<T extends ValidComponent = "div">
	extends Omit<CheckboxRootProps<T>, "value"> {
	// see: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox#checked
	// in some cases, the value is important. in other cases, not so much, we really just care about checked
	// `MyPassportSync` is one of the cases where value is important
	value?: string | boolean;
}

export const Checkbox = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, CheckboxProps<T>>,
) => {
	return (
		<CheckboxPrimitive
			{...spreadProps(props)}
			value={props.value?.toString()}
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

export type CheckboxControlProps<T extends ValidComponent = "div"> = Omit<
	KBCheckboxControlProps<T>,
	"onInput" | "onChange" | "onBlur" | "ref"
> &
	Pick<
		JSX.HTMLAttributes<HTMLInputElement>,
		"onInput" | "onChange" | "onBlur" | "ref"
	>;

export const CheckboxControl = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, CheckboxControlProps<T>>,
) => {
	const [inputProps, others] = splitProps(props, [
		"onInput",
		"onChange",
		"onBlur",
		"ref",
	]);

	return (
		<>
			<CheckboxPrimitive.Input
				// kb checkbox input does not have `onInput` and the `onChange` signature is different but
				// `onInput` is forwarded correctly and `onChange` is not used to get the value with modular
				// forms, only to trigger revalidation
				{...(inputProps as any)}
				class={cn(
					"[&:focus-visible+div]:outline-none [&:focus-visible+div]:ring-2 [&:focus-visible+div]:ring-ring",
					"[&:focus-visible+div]:ring-offset-2 [&:focus-visible+div]:ring-offset-background",
				)}
			/>
			<CheckboxPrimitive.Control
				// TODO: some prop error even though there shouldn't be any
				{...(others as any)}
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
};

export const CheckboxInputGroup = (
	props: ParentProps<JSX.HTMLAttributes<HTMLDivElement>>,
) => (
	<div
		{...spreadProps(props)}
		class={cn("flex items-center gap-4", props.class)}
	/>
);
