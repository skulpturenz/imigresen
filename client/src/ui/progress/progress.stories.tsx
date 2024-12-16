import { createSignal, onMount } from "solid-js";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Progress } from "ui/progress";

export default {
	title: "ui/progress",
	parameters: {
		docs: {
			description: {
				component:
					"Displays an indicator showing the completion progress of a task, typically displayed as a progress bar",
			},
		},
	},
} satisfies Meta<typeof Progress>;

export const Default: Story<typeof Progress> = {
	render: () => {
		const [progress, setProgress] = createSignal(0);

		onMount(() => {
			const timeout = setInterval(() => {
				setProgress(Math.min(progress() + 0.1 * 100, 100));

				if (progress() === 100) {
					clearInterval(timeout);
				}
			}, 1000);

			return () => clearInterval(timeout);
		});

		return <Progress value={progress()} class="w-96" />;
	},
};
