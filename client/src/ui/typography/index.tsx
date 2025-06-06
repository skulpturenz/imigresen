import { cva, type VariantProps } from "class-variance-authority";
import { spreadProps } from "core/utils/utils";
import type { ValidComponent } from "solid-js";
import { Dynamic, type DynamicProps } from "solid-js/web";
import { cn } from "ui/utils";

export const typographyVariants = cva("", {
	variants: {
		variant: {
			blockquote: "mt-6 border-l-2 pl-6 italic",
			h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
			h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
			h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
			h4: "scroll-m-20 text-xl font-semibold tracking-tight",
			large: "text-lg font-semibold",
			lead: "text-xl text-muted-foreground",
			muted: "text-sm text-muted-foreground",
			ol: "my-6 ml-6 list-decimal [&>li]:mt-2",
			p: "leading-7 [&:not(:first-child)]:mt-6",
			small: "text-sm font-medium leading-none",
			ul: "my-6 ml-6 list-disc [&>li]:mt-2",
			code: "relative rounded text-muted-foreground bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
		},
	},
	defaultVariants: {
		variant: "p",
	},
});

export const Typography = <T extends ValidComponent>(
	props: Omit<DynamicProps<T>, "component"> &
		VariantProps<typeof typographyVariants> & { as?: T },
) => {
	const getDefaultComponentForVariant = (variant: typeof props.variant) => {
		const componentVariantMap: Record<
			Exclude<typeof props.variant, undefined | null>,
			ValidComponent
		> = {
			blockquote: "blockquote",
			h1: "h1",
			h2: "h2",
			h3: "h3",
			h4: "h4",
			large: "div",
			lead: "p",
			muted: "p",
			ol: "ol",
			p: "p",
			small: "small",
			ul: "ul",
			code: "code",
		};

		if (!variant) {
			return "p";
		}

		return componentVariantMap[variant];
	};

	return (
		<Dynamic
			{...spreadProps(props)}
			ref={props.ref}
			component={props.as || getDefaultComponentForVariant(props.variant)}
			class={cn(
				typographyVariants({ variant: props.variant }),
				props.class,
			)}>
			{props.children}
		</Dynamic>
	);
};
