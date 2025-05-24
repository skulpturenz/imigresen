import { cva } from "class-variance-authority";
import { type Component, type JSX } from "solid-js";
import { cn } from "ui/utils";

const stepperVariants = cva("", {
	variants: {
		variant: {
			default: "space-y-4 md:flex md:space-x-8 md:space-y-0",
			panel: "divide-y divide-accent rounded-md border border-accent md:flex md:divide-y-0",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface StepperProps {
	variant?: "default" | "panel";
}

export const Stepper: Component<
	JSX.HTMLAttributes<HTMLElement> & StepperProps
> = props => {
	return (
		<nav aria-label="Progress" class={cn(props.class)}>
			<ol
				role="list"
				class={cn(stepperVariants({ variant: props.variant }))}>
				{props.children}
			</ol>
		</nav>
	);
};
