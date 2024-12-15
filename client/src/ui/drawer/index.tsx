import type {
	ContentProps,
	DescriptionProps,
	DynamicProps,
	LabelProps,
} from "@corvu/drawer";
import DrawerPrimitive from "@corvu/drawer";
import { spreadProps } from "core/utils";
import type { ComponentProps, ValidComponent } from "solid-js";
import { cn } from "ui/utils";

export const Drawer = DrawerPrimitive;

export const DrawerTrigger = DrawerPrimitive.Trigger;

export const DrawerClose = DrawerPrimitive.Close;

export const DrawerContent = <T extends ValidComponent = "div">(
	props: DynamicProps<T, ContentProps<T>>,
) => {
	const ctx = DrawerPrimitive.useContext();

	return (
		<DrawerPrimitive.Portal>
			<DrawerPrimitive.Overlay
				class="fixed inset-0 z-50 data-[transitioning]:transition-colors data-[transitioning]:duration-200"
				style={{
					"background-color": `hsl(var(--background) / ${0.8 * ctx.openPercentage()})`,
				}}
			/>
			<DrawerPrimitive.Content
				{...spreadProps(props)}
				class={cn(
					"fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-xl border bg-background",
					"after:absolute after:inset-x-0 after:top-full after:h-[50%]",
					"after:bg-inherit data-[transitioning]:transition-transform data-[transitioning]:duration-200 md:select-none",
					props.class,
				)}>
				<div class="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
				{props.children}
			</DrawerPrimitive.Content>
		</DrawerPrimitive.Portal>
	);
};

export const DrawerHeader = (props: ComponentProps<"div">) => (
	<div
		{...spreadProps(props)}
		class={cn("grid gap-1.5 p-4 text-center sm:text-left", props.class)}
	/>
);

export const DrawerFooter = (props: ComponentProps<"div">) => (
	<div
		{...spreadProps(props)}
		class={cn("mt-auto flex flex-col gap-2 p-4", props.class)}
	/>
);

export const DrawerLabel = <T extends ValidComponent = "h2">(
	props: DynamicProps<T, LabelProps>,
) => (
	<DrawerPrimitive.Label
		{...(spreadProps(props) as LabelProps)}
		class={cn(
			"text-lg font-semibold leading-none tracking-tight",
			props.class,
		)}
	/>
);

export const DrawerDescription = <T extends ValidComponent = "p">(
	props: DynamicProps<T, DescriptionProps>,
) => (
	<DrawerPrimitive.Description
		{...(spreadProps(props) as DescriptionProps)}
		class={cn("text-sm text-muted-foreground", props.class)}
	/>
);
