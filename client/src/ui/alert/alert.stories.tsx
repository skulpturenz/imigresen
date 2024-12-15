import { Terminal } from "lucide-solid";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Alert, AlertDescription, AlertTitle } from "ui/alert";

export default {
	title: "ui/alert",
	component: Alert,
	parameters: {
		docs: {
			description: {
				component: "Displays a callout for user attention",
			},
		},
	},
} satisfies Meta<typeof Alert>;

export const Default: Story<typeof Alert> = {
	render: () => (
		<Alert>
			<Terminal class="h-4 w-4" />
			<AlertTitle>Heads up!</AlertTitle>
			<AlertDescription>
				You can add components to your app using the cli.
			</AlertDescription>
		</Alert>
	),
};
