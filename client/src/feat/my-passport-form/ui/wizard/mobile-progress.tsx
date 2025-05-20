import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import type { Component, JSXElement, ParentProps } from "solid-js";
import { For, Portal, Show } from "solid-js/web";
import { Button } from "ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "ui/drawer";
import { Stepper } from "ui/stepper";
import { PanelStep } from "ui/stepper/panel-step";
import { cn } from "ui/utils";
import type { WizardStep } from "./types.ts";

export interface MobileProgressProps {
	steps: WizardStep[];
	Footer?: JSXElement;
}

export const MobileProgress: Component<
	ParentProps<MobileProgressProps>
> = props => {
	const t = useI18n<typeof resources>();

	return (
		<Portal>
			<div class="sm:hidden flex justify-center">
				<div
					class={cn(
						"fixed bottom-[env(safe-area-inset-bottom)] bg-background/70 backdrop-blur-sm",
						"text-secondary-foreground w-full p-4 shadow",
					)}>
					<Drawer>
						<DrawerTrigger
							as={Button}
							variant="ghost"
							class="w-full">
							{t("doShowProgressMobile")}
						</DrawerTrigger>
						<DrawerContent class="flex flex-col items-center px-8 my-10 space-y-8">
							<Stepper variant="panel" class="w-full">
								<For each={props.steps}>
									{(step, idx) => (
										<PanelStep
											status={step.status}
											label={step.label}
											step={idx()}
											href={step.hash}
											isLastStep={
												idx() === props.steps.length - 1
											}
										/>
									)}
								</For>
							</Stepper>

							<Show when={props.Footer}>
								<div class="w-full">{props.Footer}</div>
							</Show>
						</DrawerContent>
					</Drawer>
				</div>
			</div>
		</Portal>
	);
};
