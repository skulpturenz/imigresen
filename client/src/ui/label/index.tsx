import type { PolymorphicProps } from "@kobalte/core";
import { cva, type VariantProps } from "class-variance-authority";
import { spreadProps } from "core/utils";
import { Info } from "lucide-solid";
import { Show, type ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui/tooltip";
import { cn } from "ui/utils";

export const label = cva(
	"text-base sm:text-sm font-medium leading-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
	{
		variants: {
			label: {
				true: "text-foreground data-[invalid]:text-destructive",
			},
			error: {
				true: "text-destructive",
			},
			description: {
				true: "font-normal text-muted-foreground",
			},
		},
		defaultVariants: {
			label: true,
		},
	},
);

export interface LabelProps extends VariantProps<typeof label> {
	info?: string;
}

export const Label = <T extends ValidComponent = "label">(
	props: PolymorphicProps<T, LabelProps>,
) => (
	<div class="flex gap-4 items-center">
		<div>
			<Dynamic
				{...spreadProps(props)}
				ref={props.ref}
				component={props.as ?? "label"}
				class={cn(
					label({
						label: props.label,
						error: props.error,
						description: props.description,
					}),
					props.class,
				)}
			/>
		</div>

		<Show when={props.info}>
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
