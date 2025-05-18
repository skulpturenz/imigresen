import { useI18n } from "core/context/i18n";
import { For, Show } from "solid-js";
import { Typography } from "ui/typography";
import { cn } from "ui/utils";
import type { resources } from "./resources/i18n/en-US";

const steps = [
	{ id: "Step 1", name: "Personal details", href: "#", status: "current" },
	{ id: "Step 2", name: "Previous documents", href: "#", status: "upcoming" },
	{ id: "Step 3", name: "Declaration", href: "#", status: "upcoming" },
];

export const MyPassportForm = () => {
	const t = useI18n<typeof resources>();

	return (
		<div class="flex md:flex-col gap-4 md:gap-12 border border-accent py-8 px-4 md:px-8">
			<div>
				<nav aria-label="Progress">
					<ol
						role="list"
						class="space-y-4 md:flex md:space-x-8 md:space-y-0">
						<For each={steps}>
							{step => (
								<li class="md:flex-1">
									<Show when={step.status === "complete"}>
										<a
											href={step.href}
											class={cn(
												"group flex flex-col border-l-4 transition-colors",
												"py-2 pl-4 border-muted-foreground hover:border-foreground",
												"md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
											)}>
											<Typography
												variant="small"
												as="span"
												class="leading-normal text-muted-foreground group-hover:text-foreground">
												{step.id}
											</Typography>
											<Typography
												variant="small"
												as="span"
												class="text-muted-foreground group-hover:text-foreground">
												{step.name}
											</Typography>
										</a>
									</Show>
									<Show when={step.status === "current"}>
										<a
											href={step.href}
											aria-current="step"
											class={cn(
												"flex flex-col border-l-4 border-accent py-2 transition-colors",
												"pl-4 border-foreground md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
											)}>
											<Typography
												variant="small"
												as="span"
												class="leading-normal">
												{step.id}
											</Typography>
											<Typography
												variant="small"
												as="span">
												{step.name}
											</Typography>
										</a>
									</Show>
									<Show
										when={
											step.status !== "complete" &&
											step.status !== "current"
										}>
										<a
											href={step.href}
											class={cn(
												"group flex flex-col border-l-4 transition-colors",
												"py-2 pl-4 border-accent hover:border-foreground md:border-l-0",
												"md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
											)}>
											<Typography
												variant="small"
												as="span"
												class="leading-normal text-muted-foreground group-hover:text-foreground">
												{step.id}
											</Typography>
											<Typography
												variant="small"
												as="span"
												class="text-muted-foreground group-hover:text-foreground">
												{step.name}
											</Typography>
										</a>
									</Show>
								</li>
							)}
						</For>
					</ol>
				</nav>
			</div>
			<div>
				<Typography>{t("helloWorld")}</Typography>
			</div>
		</div>
	);
};
