import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import {
	TextField as TextFieldPrimitive,
	type TextFieldLabelProps as KbTextFieldLabelProps,
	type TextFieldDescriptionProps,
	type TextFieldErrorMessageProps,
	type TextFieldInputProps,
	type TextFieldRootProps,
} from "@kobalte/core/text-field";
import { styles } from "core/constants/styles";
import { spreadProps } from "core/utils/utils";
import { Info } from "lucide-solid";
import { Show, type ValidComponent } from "solid-js";
import { label } from "ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui/tooltip";
import { cn } from "ui/utils";

export const TextFieldRoot = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldRootProps<T>>,
) => (
	<TextFieldPrimitive
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("flex flex-col space-y-4", props.class)}
	/>
);

export interface TextFieldLabelProps<T extends ValidComponent = "label">
	extends KbTextFieldLabelProps<T> {
	info?: string;
}

export const TextFieldLabel = <T extends ValidComponent = "label">(
	props: PolymorphicProps<T, TextFieldLabelProps<T>>,
) => (
	<div class="flex gap-4 items-center">
		<div>
			<TextFieldPrimitive.Label
				{...spreadProps<any>(props)}
				ref={props.ref}
				class={cn(label(), props.class)}
			/>
		</div>

		<Show when={props.info && styles.device.hasHover()}>
			<div class="text-foreground">
				<Tooltip>
					<TooltipTrigger>
						<Info class="size-[0.875rem]" />
					</TooltipTrigger>

					<TooltipContent class="max-w-sm text-wrap break-all">
						<p>{props.info}</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</Show>
	</div>
);

export const TextFieldErrorMessage = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldErrorMessageProps<T>>,
) => (
	<TextFieldPrimitive.ErrorMessage
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(label({ error: true }), props.class)}
	/>
);

export const TextFieldDescription = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldDescriptionProps<T>>,
) => (
	<TextFieldPrimitive.Description
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(label({ description: true, label: false }), props.class)}
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
			"focus-visible:ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
			"file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
			"focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			"data-[invalid]:animate-headShake disabled:data-[invalid]:animate-none data-[invalid]:border-destructive",
			"data-[invalid]:text-destructive data-[invalid]:border data-[invalid]:placeholder-destructive transition-shadow",
			props.class,
		)}
	/>
);
