import { styles } from "core/constants/styles";
import {
	createSignal,
	For,
	Show,
	type Component,
	type JSXElement,
	type ParentProps,
} from "solid-js";
import { Stepper } from "ui/stepper";
import { SimpleStep } from "ui/stepper/simple-step";
import { cn } from "ui/utils";
import { MobileProgress } from "./mobile-progress";
import type { WizardStep } from "./types";

export interface WizardProps {
	steps: WizardStep[];
	Footer?: JSXElement;
}

export const Wizard: Component<ParentProps<WizardProps>> = props => {
	const [isProgressFirstItemOnGrid, setIsProgressFirstItemOnGrid] =
		createSignal(true);

	const adjustProgressPosition = () => {
		if (styles.breakpoints.isMedium() || styles.breakpoints.isVerySmall()) {
			setIsProgressFirstItemOnGrid(true);

			return;
		}

		const totalWidth = screen.width;
		const spaceOnLeftSide = window.screenLeft;
		const percentageOfSpaceOnLeftSide =
			(spaceOnLeftSide / totalWidth) * 100;

		// first item on grid means progress shows at the top or to the left
		setIsProgressFirstItemOnGrid(percentageOfSpaceOnLeftSide <= 45);
	};

	const resizeObserver = new ResizeObserver(adjustProgressPosition);
	resizeObserver.observe(document.body);

	window.addEventListener("mouseout", adjustProgressPosition);

	return (
		<>
			<div class="grid grid-cols-3 md:flex md:gap-12 md:flex-col border border-accent py-8 px-4 md:px-8 mb-24 sm:mb-0">
				<div
					class={cn(
						"col-span-1",
						isProgressFirstItemOnGrid() ? "block" : "hidden",
					)}>
					<Stepper class="hidden sm:block sm:top-[40%] sm:sticky md:static md:top-auto">
						<For each={props.steps}>
							{step => (
								<SimpleStep
									status={step.status}
									label={step.label}
									description={step.description}
									href={step.hash}
								/>
							)}
						</For>
					</Stepper>
				</div>

				<div class="sm:col-span-2 col-span-3 w-full">
					{props.children}
				</div>

				<div
					class={cn(
						"col-span-1",
						!isProgressFirstItemOnGrid() ? "block" : "hidden",
					)}>
					<Stepper class="hidden sm:block sm:top-[40%] sm:sticky md:static md:top-auto">
						<For each={props.steps}>
							{step => (
								<SimpleStep
									status={step.status}
									label={step.label}
									description={step.description}
									href={step.hash}
									invertIndicator
								/>
							)}
						</For>
					</Stepper>
				</div>
			</div>

			<Show when={props.Footer}>
				<div class="hidden sm:grid grid-cols-3 md:block">
					<div
						class={cn(
							"col-span-3 sm:col-span-2 sm:col-start-2 md:col-auto",
							isProgressFirstItemOnGrid()
								? "sm:col-start-2"
								: "sm:col-start-auto",
						)}>
						{props.Footer}
					</div>
				</div>
			</Show>

			<MobileProgress steps={props.steps} Footer={props.Footer} />
		</>
	);
};
