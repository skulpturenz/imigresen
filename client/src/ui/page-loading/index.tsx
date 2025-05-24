import { animate } from "motion";
import {
	createEffect,
	createSignal,
	mergeProps,
	onCleanup,
	onMount,
	type Component,
	type ParentProps,
} from "solid-js";
import { Dialog, DialogOverlay, DialogPortal } from "ui/dialog";
import { cn } from "ui/utils";

export interface PageLoadingProps {
	isLoading?: boolean;
}

const resources = {
	srOnly: "Loading",
};

export const PageLoading: Component<ParentProps<PageLoadingProps>> = props => {
	const [hasDelayElapsed, setHasDelayElapsed] = createSignal(false);

	const [loaderRef, setLoaderRef] = createSignal<HTMLSpanElement | null>(
		null,
	);

	const withDefaultProps = mergeProps(
		{
			isLoading: true,
		},
		props,
	);

	createEffect(() => {
		if (!withDefaultProps.isLoading || !loaderRef()) {
			return;
		}

		const controls = animate(
			loaderRef() as HTMLSpanElement,
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

		onCleanup(() => {
			controls.stop();
		});
	});

	onMount(() => {
		const DELAY_MS = 250;

		setTimeout(() => {
			setHasDelayElapsed(true);
		}, DELAY_MS);
	});

	return (
		<Dialog open={withDefaultProps.isLoading && hasDelayElapsed()} modal>
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
						ref={setLoaderRef}
						class={cn(
							"size-6 md:size-8 lg:size-12 rounded-full bg-primary relative",
						)}>
						<span class="size-6 md:size-8 lg:size-12 bg-primary absolute rounded-full animate-ping" />

						<span class="sr-only">{resources.srOnly}</span>
					</span>
				</div>
			</DialogPortal>
		</Dialog>
	);
};
