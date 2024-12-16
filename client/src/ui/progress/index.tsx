import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { ProgressRootProps } from "@kobalte/core/progress";
import { Progress as ProgressPrimitive } from "@kobalte/core/progress";
import { spreadProps } from "core/utils";
import type { ValidComponent } from "solid-js";
import { cn } from "ui/utils";

export const ProgressLabel = ProgressPrimitive.Label;

export const ProgressValueLabel = ProgressPrimitive.ValueLabel;

export const Progress = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, ProgressRootProps<T>>,
) => (
	<ProgressPrimitive
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("flex w-full flex-col gap-2", props.class)}>
		{props.children}
		<ProgressPrimitive.Track class="h-4 overflow-hidden rounded-full bg-secondary">
			<ProgressPrimitive.Fill class="h-full w-[--kb-progress-fill-width] bg-primary transition-all duration-500 ease-linear data-[progress=complete]:bg-primary" />
		</ProgressPrimitive.Track>
	</ProgressPrimitive>
);
