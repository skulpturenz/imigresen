import type { HoverCardContentProps } from "@kobalte/core/hover-card";
import { HoverCard as HoverCardPrimitive } from "@kobalte/core/hover-card";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { spreadProps } from "core/utils";
import type { ValidComponent } from "solid-js";
import { cn } from "ui/utils";

export const HoverCard = HoverCardPrimitive;

export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export const HoverCardContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, HoverCardContentProps<T>>,
) => (
	<HoverCardPrimitive.Portal>
		<HoverCardPrimitive.Content
			{...spreadProps(props)}
			class={cn(
				"z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
				"data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0",
				"data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
				props.class,
			)}
		/>
	</HoverCardPrimitive.Portal>
);
