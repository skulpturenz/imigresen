import { animate } from "motion";
import {
	mergeProps,
	onMount,
	type Component,
	type ParentProps,
} from "solid-js";
import { Dialog, DialogOverlay, DialogPortal } from "ui/dialog";
import { cn } from "ui/utils";

export interface PageLoadingProps {
	isLoading?: boolean;
}

export const PageLoading: Component<ParentProps<PageLoadingProps>> = props => {
	const withDefaultProps = mergeProps(
		{
			isLoading: true,
		},
		props,
	);

	onMount(() => {
		if (!withDefaultProps.isLoading) {
			return;
		}

		animate(
			".loading-dot",
			{
				x: [-40, 40],
				y: [0, -60],
			},
			{
				x: {
					duration: 0.5,
					repeatType: "reverse",
					repeat: Infinity,
				},
				y: {
					duration: 0.25,
					repeat: Infinity,
					repeatType: "reverse",
					ease: "easeOut",
				},
			},
		);
	});

	return (
		<Dialog open={withDefaultProps.isLoading} modal>
			<DialogPortal>
				<DialogOverlay
					class={cn(
						"fixed inset-0 z-50 bg-black/80  data-[expanded]:animate-in data-[closed]:animate-out",
						"data-[closed]:fade-out-0 data-[expanded]:fade-in-0",
					)}
				/>

				<div
					class={cn(
						"h-screen w-screen flex gap-2 md:gap-4 lg:gap-4 justify-center items-center z-50 fixed translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%]",
					)}>
					<span
						class={cn(
							"loading-dot size-6 md:size-8 lg:size-12 rounded-full bg-primary relative",
						)}>
						<span class="size-6 md:size-8 lg:size-12 bg-primary absolute rounded-full animate-ping" />
					</span>
				</div>
			</DialogPortal>
		</Dialog>
	);
};
