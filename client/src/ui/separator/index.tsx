import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { SeparatorRootProps } from "@kobalte/core/separator";
import { Separator as SeparatorPrimitive } from "@kobalte/core/separator";
import { spreadProps } from "core/utils";
import type { ValidComponent } from "solid-js";
import { cn } from "ui/utils";

export const Separator = <T extends ValidComponent = "hr">(
	props: PolymorphicProps<T, SeparatorRootProps<T>>,
) => (
	<SeparatorPrimitive
		{...spreadProps(props)}
		class={cn(
			"shrink-0 bg-border",
			"data-[orientation=horizontal]:h-[1px] data-[orientation=horizontal]:w-full",
			"data-[orientation=vertical]:h-full data-[orientation=vertical]:w-[1px]",
			props.class,
		)}
	/>
);
