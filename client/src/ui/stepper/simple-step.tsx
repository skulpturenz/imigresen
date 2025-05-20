import { Show, type Component, type ParentProps } from "solid-js";
import { Typography } from "ui/typography";
import { cn } from "ui/utils";

export interface SimpleStepProps {
	status: "complete" | "current" | "upcoming";
	label?: string;
	description?: string;
	href?: string;
	onClick?: () => void;
	invertIndicator?: boolean;
}

export const SimpleStep: Component<ParentProps<SimpleStepProps>> = props => {
	return (
		<li class="md:flex-1">
			<Show when={props.status === "complete"}>
				<a
					href={props.href}
					onClick={props.onClick}
					class={cn(
						"group flex flex-col transition-colors",
						"py-2 border-muted-foreground hover:border-emerald-500 dark:hover:border-emerald-600",
						props.invertIndicator
							? "border-r-4 md:border-r-0 md:border-t-4 pr-4 md:pt-4 md:pb-0 md:pr-0 text-right md:text-left"
							: "border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pt-4 pl-4 md:pl-0 text-left",
					)}>
					<Show when={props.label}>
						<Typography
							variant="small"
							as="span"
							class="leading-normal text-muted-foreground group-hover:text-foreground">
							{props.label}
						</Typography>
					</Show>
					<Show when={props.description}>
						<Typography
							variant="small"
							as="span"
							class="text-muted-foreground group-hover:text-foreground">
							{props.description}
						</Typography>
					</Show>
				</a>
			</Show>
			<Show when={props.status === "current"}>
				<a
					href={props.href}
					onClick={props.onClick}
					aria-current="step"
					class={cn(
						"flex flex-col py-2 transition-colors border-foreground",
						props.invertIndicator
							? "border-r-4 md:border-r-0 md:border-t-4 pr-4 md:pt-4 md:pb-0 md:pr-0 text-right md:text-left"
							: "border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pt-4 pl-4 md:pl-0 text-left",
					)}>
					<Show when={props.label}>
						<Typography
							variant="small"
							as="span"
							class="leading-normal">
							{props.label}
						</Typography>
					</Show>
					<Show when={props.description}>
						<Typography variant="small" as="span">
							{props.description}
						</Typography>
					</Show>
				</a>
			</Show>
			<Show
				when={
					props.status !== "complete" && props.status !== "current"
				}>
				<a
					href={props.href}
					onClick={props.onClick}
					class={cn(
						"group flex flex-col transition-colors py-2 border-accent hover:border-yellow-500 dark:hover:border-yellow-600",
						props.invertIndicator
							? "border-r-4 md:border-r-0 md:border-t-4 pr-4 md:pt-4 md:pb-0 md:pr-0 text-right md:text-left"
							: "border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pt-4 pl-4 md:pl-0 text-left",
					)}>
					<Show when={props.label}>
						<Typography
							variant="small"
							as="span"
							class="leading-normal text-muted-foreground group-hover:text-foreground">
							{props.label}
						</Typography>
					</Show>
					<Show when={props.description}>
						<Typography
							variant="small"
							as="span"
							class="text-muted-foreground group-hover:text-foreground">
							{props.description}
						</Typography>
					</Show>
				</a>
			</Show>
		</li>
	);
};
