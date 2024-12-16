import type { TooltipTriggerProps } from "@kobalte/core/tooltip";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Button } from "ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui/tooltip";

export default {
	title: "ui/tooltip",
	component: Tooltip,
	parameters: {
		docs: {
			description: {
				component:
					"A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it",
			},
		},
	},
} satisfies Meta<typeof Tooltip>;

export const Default: Story<typeof Tooltip> = {
	render: () => (
		<Tooltip>
			<TooltipTrigger
				as={(props: TooltipTriggerProps) => (
					<Button variant="outline" {...props}>
						Hover
					</Button>
				)}
			/>
			<TooltipContent>
				<p>Add to library</p>
			</TooltipContent>
		</Tooltip>
	),
};
