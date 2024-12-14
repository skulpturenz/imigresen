import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type {
	SwitchControlProps,
	SwitchLabelProps,
	SwitchRootProps,
	SwitchThumbProps,
} from "@kobalte/core/switch";
import { Switch as SwitchPrimitive } from "@kobalte/core/switch";
import { spreadProps } from "core/utils";
import type { ValidComponent } from "solid-js";
import type { JSX } from "solid-js/h/jsx-runtime";
import { label } from "ui/label";
import { cn } from "ui/utils";

export const SwitchLabel = <T extends ValidComponent = "label">(
	props: PolymorphicProps<T, SwitchLabelProps<T>>,
) => (
	<SwitchPrimitive.Label
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(label(), props.class)}
	/>
);

export const Switch = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, SwitchRootProps<T>>,
) => (
	<SwitchPrimitive
		{...spreadProps(props)}
		class={cn(
			"data-[invalid]:animate-headShake disabled:cursor-not-allowed",
			props.class,
		)}
	/>
);

export const SwitchControl = <T extends ValidComponent = "input">(
	props: PolymorphicProps<T, SwitchControlProps<T>> & {
		inputRef?: JSX.IntrinsicAttributes["ref"];
	},
) => (
	<>
		<SwitchPrimitive.Input
			ref={props.inputRef}
			class={cn(
				"[&:focus-visible+div]:outline-none [&:focus-visible+div]:ring-[1.5px] [&:focus-visible+div]:ring-ring",
				"[&:focus-visible+div]:ring-offset-2 [&:focus-visible+div]:ring-offset-background",
			)}
		/>
		<SwitchPrimitive.Control
			{...spreadProps(props)}
			ref={props.ref}
			class={cn(
				"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
				"transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"focus-visible:ring-offset-background data-[disabled]:cursor-not-allowed disabled:cursor-not-allowed",
				"data-[disabled]:opacity-50 data-[checked]:bg-primary bg-input data-[checked]:data-[invalid]:bg-destructive",
				props.class,
			)}>
			{props.children}
		</SwitchPrimitive.Control>
	</>
);

export const SwitchThumb = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, SwitchThumbProps<T>>,
) => (
	<SwitchPrimitive.Thumb
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
			"data-[checked]:translate-x-5 translate-x-0",
			props.class,
		)}
	/>
);
