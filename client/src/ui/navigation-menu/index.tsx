import {
	type NavigationMenuTriggerProps as KbNavigationMenuTriggerProps,
	type NavigationMenuContentProps,
	NavigationMenu as NavigationMenuPrimitive,
	type NavigationMenuRootProps,
} from "@kobalte/core/navigation-menu";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { spreadProps } from "core/utils";
import { ChevronDown } from "lucide-solid";
import {
	type ParentProps,
	Show,
	type ValidComponent,
	mergeProps,
} from "solid-js";
import { cn } from "ui/utils";

export const NavigationMenuItem = NavigationMenuPrimitive.Menu;

export const NavigationMenuLink = NavigationMenuPrimitive.Item;

export const NavigationMenuItemLabel = NavigationMenuPrimitive.ItemLabel;

export const NavigationMenuDescription =
	NavigationMenuPrimitive.ItemDescription;

export const NavigationMenuItemIndicator =
	NavigationMenuPrimitive.ItemIndicator;

export const NavigationMenuSub = NavigationMenuPrimitive.Sub;

export const NavigationMenuSubTrigger = NavigationMenuPrimitive.SubTrigger;

export const NavigationMenuSubContent = NavigationMenuPrimitive.SubContent;

export const NavigationMenuRadioGroup = NavigationMenuPrimitive.RadioGroup;

export const NavigationMenuRadioItem = NavigationMenuPrimitive.RadioItem;

export const NavigationMenuCheckboxItem = NavigationMenuPrimitive.CheckboxItem;

export const NavigationMenuSeparator = NavigationMenuPrimitive.Separator;

interface withArrow {
	withArrow?: boolean;
}

export type NavigationMenuProps<T extends ValidComponent = "ul"> = ParentProps<
	NavigationMenuRootProps<T> &
		withArrow & {
			class?: string;
		}
>;

export const NavigationMenu = <T extends ValidComponent = "ul">(
	props: PolymorphicProps<T, NavigationMenuProps<T>>,
) => {
	const withDefaultProps = mergeProps<NavigationMenuProps<T>[]>(
		{
			get gutter() {
				return props.withArrow ? props.gutter : 6;
			},
			withArrow: false,
			flip: false,
		},
		props,
	);

	return (
		<NavigationMenuPrimitive
			{...(spreadProps(withDefaultProps) as NavigationMenuProps)}
			class={cn(
				"flex w-max items-center justify-center gap-x-1",
				withDefaultProps.class,
			)}>
			{withDefaultProps.children}
			<NavigationMenuPrimitive.Viewport
				class={cn(
					"pointer-events-none z-50 overflow-x-clip overflow-y-visible rounded-md border border-border bg-popover",
					"text-popover-foreground shadow h-[--kb-navigation-menu-viewport-height] w-[--kb-navigation-menu-viewport-width]",
					"transition-[width,height] duration-300 origin-[--kb-menu-content-transform-origin]",
					"data-[expanded]:duration-300 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:zoom-in-95",
					"data-[closed]:duration-300 data-[closed]:animate-out data-[closed]:fade-out data-[closed]:zoom-out-95",
				)}>
				<Show when={withDefaultProps.withArrow}>
					<NavigationMenuPrimitive.Arrow class="transition-transform duration-300" />
				</Show>
			</NavigationMenuPrimitive.Viewport>
		</NavigationMenuPrimitive>
	);
};

export type NavigationMenuTriggerProps<T extends ValidComponent = "button"> =
	ParentProps<
		KbNavigationMenuTriggerProps<T> &
			withArrow & {
				class?: string;
			}
	>;

export const NavigationMenuTrigger = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, NavigationMenuTriggerProps<T>>,
) => {
	const withDefaultProps = mergeProps<NavigationMenuTriggerProps<T>[]>(
		{
			get withArrow() {
				return props.as === undefined ? true : props.withArrow;
			},
		},
		props,
	);

	return (
		<NavigationMenuPrimitive.Trigger
			{...(spreadProps(withDefaultProps) as NavigationMenuTriggerProps)}
			class={cn(
				"inline-flex w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm",
				"font-medium outline-none transition-colors duration-300 hover:bg-accent hover:text-accent-foreground",
				"disabled:pointer-events-none disabled:opacity-50",
				withDefaultProps.class,
			)}>
			{withDefaultProps.children}
			<Show when={withDefaultProps.withArrow}>
				<NavigationMenuPrimitive.Icon class="group">
					<ChevronDown class="ml-1 size-3 transition-transform duration-300 group-data-[expanded]:rotate-180" />
				</NavigationMenuPrimitive.Icon>
			</Show>
		</NavigationMenuPrimitive.Trigger>
	);
};

export const NavigationMenuContent = <T extends ValidComponent = "ul">(
	props: PolymorphicProps<T, NavigationMenuContentProps<T>>,
) => (
	<NavigationMenuPrimitive.Portal>
		<NavigationMenuPrimitive.Content
			{...spreadProps(props)}
			class={cn(
				"absolute left-0 top-0 p-4 outline-none",
				"data-[motion^=from-]:duration-300 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in",
				"data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52",
				"data-[motion^=to-]:duration-300 data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out",
				"data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
				props.class,
			)}>
			{props.children}
		</NavigationMenuPrimitive.Content>
	</NavigationMenuPrimitive.Portal>
);
