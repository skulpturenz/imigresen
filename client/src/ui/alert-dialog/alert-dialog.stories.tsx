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

export default {
	title: "ui/alert-dialog",
	component: AlertDialog,
	parameters: {
		docs: {
			description: {
				component:
					"A modal dialog that interrupts the user with important content and expects a response",
			},
		},
	},
} satisfies Meta<typeof AlertDialog>;

export const Default: Story<typeof AlertDialog> = {
	render: () => (
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
};
