import type { HoverCardTriggerProps } from "@kobalte/core/hover-card";
import { spreadProps } from "core/utils";
import { CalendarDays } from "lucide-solid";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Button } from "ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "ui/hover-card";

export default {
	title: "ui/hover-card",
	component: HoverCard,
	parameters: {
		docs: {
			description: {
				component:
					"For sighted users to preview content available behind a link",
			},
		},
	},
} satisfies Meta<typeof HoverCard>;

export const Default: Story<typeof HoverCard> = {
	render: () => (
		<HoverCard>
			<HoverCardTrigger
				as={(props: HoverCardTriggerProps) => (
					<Button {...spreadProps(props)} variant="link">
						@solid_js
					</Button>
				)}
			/>
			<HoverCardContent class="w-80">
				<div class="flex justify-between space-x-4">
					<img
						class="h-10 w-10 rounded-full"
						src="https://github.com/solidjs.png"
						alt="SolidJS"
					/>
					<div class="space-y-1">
						<h4 class="text-sm font-semibold">@solid_js</h4>
						<p class="text-sm">
							Simple and performant reactivity for building user
							interfaces.
						</p>
						<div class="flex items-center pt-2">
							<CalendarDays class="mr-2 h-4 w-4 opacity-70" />

							<span class="text-xs text-muted-foreground">
								Joined March 2021
							</span>
						</div>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	),
};
