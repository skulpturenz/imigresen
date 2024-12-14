import { toaster } from "@kobalte/core";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Button } from "ui/button";
import {
	Toast,
	ToastContent,
	ToastDescription,
	ToastList,
	ToastProgress,
	ToastRegion,
	ToastTitle,
} from "ui/toast";

export default {
	title: "ui/toast",
	component: Toast,
	parameters: {
		docs: {
			description: {
				component:
					"A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it",
			},
		},
	},
} satisfies Meta<typeof Toast>;

export const Default: Story<typeof Toast> = {
	render: () => {
		const showToast = () => {
			toaster.show(props => (
				<Toast toastId={props.toastId}>
					<ToastContent>
						<ToastTitle>Scheduled: Catch up</ToastTitle>
						<ToastDescription>
							Friday, February 10, 2023 at 5:57 PM
						</ToastDescription>
					</ToastContent>
					<ToastProgress />
				</Toast>
			));
		};

		return (
			<>
				<ToastRegion>
					<ToastList />
				</ToastRegion>

				<Button variant="outline" onClick={showToast}>
					Add to calendar
				</Button>
			</>
		);
	},
};
