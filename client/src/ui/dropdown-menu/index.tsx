import type {
	DropdownMenuCheckboxItemProps,
	DropdownMenuContentProps,
	DropdownMenuGroupLabelProps,
	DropdownMenuItemLabelProps,
	DropdownMenuItemProps,
	DropdownMenuRadioItemProps,
	DropdownMenuRootProps,
	DropdownMenuSeparatorProps,
	DropdownMenuSubTriggerProps,
} from "@kobalte/core/dropdown-menu";
import { DropdownMenu as DropdownMenuPrimitive } from "@kobalte/core/dropdown-menu";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { spreadProps } from "core/utils";
import { ArrowRight, Check, CircleDot } from "lucide-solid";
import type { ComponentProps, ValidComponent } from "solid-js";
import { mergeProps } from "solid-js";
import { cn } from "ui/utils";

const resources = {
	subTriggerSrOnly: "Expand",
	checkboxItemSrOnly: "Selected",
	radioItemSrOnly: "Selected",
};

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenu = (props: DropdownMenuRootProps) => (
	<DropdownMenuPrimitive
		{...mergeProps<DropdownMenuRootProps[]>(
			{ gutter: 4, flip: false },
			props,
		)}
	/>
);

export const DropdownMenuContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DropdownMenuContentProps<T>>,
) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			{...spreadProps(props)}
			ref={props.ref}
			class={cn(
				"min-w-[8rem] z-50 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
				"transition-shadow focus-visible:outline-none focus-visible:ring-[1.5px]",
				"focus-visible:ring-ring data-[expanded]:animate-in data-[closed]:animate-out",
				"data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
				props.class,
			)}
		/>
	</DropdownMenuPrimitive.Portal>
);

export const DropdownMenuItem = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DropdownMenuItemProps<T>>,
) => (
	<DropdownMenuPrimitive.Item
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
			"transition-colors focus:bg-accent focus:text-accent-foreground",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			props.inset && "pl-8",
			props.class,
		)}
	/>
);

export const DropdownMenuGroupLabel = <T extends ValidComponent = "span">(
	props: PolymorphicProps<T, DropdownMenuGroupLabelProps<T>>,
) => (
	<DropdownMenuPrimitive.GroupLabel
		{...spreadProps(props)}
		ref={props.ref}
		as="div"
		class={cn("px-2 py-1.5 text-sm font-semibold", props.class)}
	/>
);

export const DropdownMenuItemLabel = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DropdownMenuItemLabelProps<T>>,
) => (
	<DropdownMenuPrimitive.ItemLabel
		{...spreadProps(props)}
		ref={props.ref}
		as="div"
		class={cn("px-2 py-1.5 text-sm font-semibold", props.class)}
	/>
);

export const DropdownMenuSeparator = <T extends ValidComponent = "hr">(
	props: PolymorphicProps<T, DropdownMenuSeparatorProps<T>>,
) => (
	<DropdownMenuPrimitive.Separator
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("-mx-1 my-1 h-px bg-muted", props.class)}
	/>
);

export const DropdownMenuShortcut = (props: ComponentProps<"span">) => (
	<span
		{...spreadProps(props)}
		ref={props.ref}
		class={cn("ml-auto text-xs tracking-widest opacity-60", props.class)}
	/>
);

export const DropdownMenuSubTrigger = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DropdownMenuSubTriggerProps<T>>,
) => (
	<DropdownMenuPrimitive.SubTrigger
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
			"focus:bg-accent data-[expanded]:bg-accent [&_svg]:pointer-events-none [&_svg]:shrink-0",
			props.class,
		)}>
		{props.children}

		<ArrowRight class="ml-auto h-4 w-4">
			<span class="sr-only">{resources.subTriggerSrOnly}</span>
		</ArrowRight>
	</DropdownMenuPrimitive.SubTrigger>
);

export const DropdownMenuSubContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DropdownMenuSubTriggerProps<T>>,
) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.SubContent
			{...(spreadProps(props) as DropdownMenuRootProps)}
			ref={props.ref as Pick<ComponentProps<T>, "ref">}
			class={cn(
				"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground",
				"shadow-lg data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0",
				"data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
				props.class,
			)}
		/>
	</DropdownMenuPrimitive.Portal>
);

export const DropdownMenuCheckboxItem = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DropdownMenuCheckboxItemProps<T>>,
) => (
	<DropdownMenuPrimitive.CheckboxItem
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"relative flex cursor-default select-none items-center rounded-sm",
			"py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			props.class,
		)}>
		<DropdownMenuPrimitive.ItemIndicator class="absolute left-2 inline-flex h-4 w-4 items-center justify-center">
			<Check class="h-4 w-4">
				<span class="sr-only">{resources.checkboxItemSrOnly}</span>
			</Check>
		</DropdownMenuPrimitive.ItemIndicator>

		{props.children}
	</DropdownMenuPrimitive.CheckboxItem>
);

export const DropdownMenuRadioItem = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DropdownMenuRadioItemProps<T>>,
) => (
	<DropdownMenuPrimitive.RadioItem
		{...spreadProps(props)}
		ref={props.ref}
		class={cn(
			"relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm",
			"outline-none transition-colors focus:bg-accent focus:text-accent-foreground",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			props.class,
		)}>
		<DropdownMenuPrimitive.ItemIndicator class="absolute left-2 inline-flex h-4 w-4 items-center justify-center">
			<CircleDot class="h-4 w-4">
				<span class="sr-only">{resources.radioItemSrOnly}</span>
			</CircleDot>
		</DropdownMenuPrimitive.ItemIndicator>

		{props.children}
	</DropdownMenuPrimitive.RadioItem>
);
