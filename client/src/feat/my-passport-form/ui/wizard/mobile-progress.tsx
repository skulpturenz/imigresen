import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import {
	createSignal,
	onCleanup,
	onMount,
	type Component,
	type JSXElement,
	type ParentProps,
} from "solid-js";
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
	let mobileProgressRef: HTMLDivElement | undefined;

	const t = useI18n<typeof resources>();

	const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);
	const toggleIsDrawerOpen = () =>
		setIsDrawerOpen(isDrawerOpen => !isDrawerOpen);

	const hideDrawerOnClickAway = (event: MouseEvent) => {
		if (
			mobileProgressRef?.contains(event.target as Node) ||
			!isDrawerOpen()
		) {
			return;
		}

		toggleIsDrawerOpen();
	};

	const onClickTrigger = (event: MouseEvent) => {
		event.stopImmediatePropagation();

		toggleIsDrawerOpen();
	};

	const onClickFooter = (event: MouseEvent) => {
		event.stopImmediatePropagation();

		toggleIsDrawerOpen();
	};

	onMount(() => {
		document.addEventListener("click", hideDrawerOnClickAway);
	});

	onCleanup(() => {
		document.removeEventListener("click", hideDrawerOnClickAway);
	});

	// TODO: swiping down doesn't close the drawer entirely unlike without specifying `open`

	return (
		<Portal>
			<div class="sm:hidden flex justify-center">
				<div
					class={cn(
						"fixed bottom-[env(safe-area-inset-bottom)] bg-background/70 backdrop-blur-sm",
						"text-secondary-foreground w-full p-4 shadow",
					)}>
					<Drawer open={isDrawerOpen()}>
						<DrawerTrigger
							as={Button}
							onClick={onClickTrigger}
							variant="ghost"
							class="w-full">
							{t("doShowProgressMobile")}
						</DrawerTrigger>
						<DrawerContent
							ref={mobileProgressRef}
							class="flex flex-col items-center px-8 my-10 space-y-8">
							<Stepper variant="panel" class="w-full">
								<For each={props.steps}>
									{(step, idx) => {
										const getHref = () =>
											[location.search, step.hash]
												.filter(Boolean)
												.join("");

										return (
											<PanelStep
												status={step.status}
												label={step.description}
												step={idx() + 1}
												href={getHref()}
												onClick={toggleIsDrawerOpen}
												isLastStep={
													idx() ===
													props.steps.length - 1
												}
											/>
										);
									}}
								</For>
							</Stepper>

							<Show when={props.Footer}>
								<div class="w-full" onClick={onClickFooter}>
									{props.Footer}
								</div>
							</Show>
						</DrawerContent>
					</Drawer>
				</div>
			</div>
		</Portal>
	);
};
