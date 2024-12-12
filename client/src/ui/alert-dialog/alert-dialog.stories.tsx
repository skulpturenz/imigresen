import type { AlertDialogTriggerProps } from "@kobalte/core/alert-dialog";
import { spreadProps } from "core/utils";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "ui/alert-dialog";
import { Button } from "ui/button";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
export default {
	title: "ui/alert-dialog",
	component: () => (
		<AlertDialog>
			<AlertDialogTrigger
				as={(props: AlertDialogTriggerProps) => (
					<Button variant="outline" {...spreadProps(props)}>
						Show Dialog
					</Button>
				)}
			/>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you absolutely sure?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently
						delete your account and remove your data from our
						servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogClose>Cancel</AlertDialogClose>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: "centered",
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ["autodocs"],
} satisfies Meta;

export const Primary: Story = {};
