import { A } from "@solidjs/router";
import { CheckIcon } from "lucide-solid";
import { Show, type Component, type ParentProps } from "solid-js";
import { cn } from "ui/utils";
import type { StepStatus } from "./types";

export interface PanelStepProps {
	status: StepStatus;
	step: number;
	label: string;
	href?: string;
	onClick?: () => void;
	isLastStep?: boolean;
}

export const PanelStep: Component<ParentProps<PanelStepProps>> = props => {
	return (
		<li class="relative md:flex md:flex-1">
			<Show when={props.status === "complete"}>
				<A
					href={props.href ?? ""}
					class="group flex w-full items-center transition-colors">
					<span class="flex items-center px-6 py-4 text-sm font-medium">
						<span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground group-hover:bg-emerald-500 dark:group-hover:bg-emerald-600">
							<CheckIcon
								aria-hidden="true"
								class="size-6 text-background"
							/>
						</span>
						<span class="ml-4 text-sm font-medium text-foreground">
							{props.label}
						</span>
					</span>
				</A>
			</Show>

			<Show when={props.status === "current"}>
				<A
					href={props.href ?? ""}
					aria-current="step"
					class="flex items-center px-6 py-4 text-sm font-medium transition-colors">
					<span class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground">
						<span class="text-foreground">{props.step}</span>
					</span>
					<span class="ml-4 text-sm font-medium text-foreground">
						{props.label}
					</span>
				</A>
			</Show>

			<Show
				when={
					props.status !== "complete" && props.status !== "current"
				}>
				<A
					href={props.href ?? ""}
					class="group flex items-center transition-colors">
					<span class="flex items-center px-6 py-4 text-sm font-medium">
						<span
							class={cn(
								"flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-accent",
								"group-hover:border-yellow-500 dark:group-hover:border-yellow-600",
							)}>
							<span class="text-muted-foreground group-hover:text-foreground">
								{props.step}
							</span>
						</span>
						<span class="ml-4 text-sm font-medium text-muted-foreground group-hover:text-foreground">
							{props.label}
						</span>
					</span>
				</A>
			</Show>

			<Show when={!props.isLastStep}>
				<div
					aria-hidden="true"
					class="absolute right-0 top-0 hidden h-full w-5 md:block">
					<svg
						fill="none"
						viewBox="0 0 22 80"
						preserveAspectRatio="none"
						class="size-full text-accent">
						<path d="M0 -2L20 40L0 82" stroke="currentcolor" />
					</svg>
				</div>
			</Show>
		</li>
	);
};
