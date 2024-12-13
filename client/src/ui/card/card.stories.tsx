import { BellIcon, Check } from "lucide-solid";
import { For } from "solid-js";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Button } from "ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "ui/card";

export default {
	title: "ui/card",
	component: Card,
	parameters: {
		docs: {
			description: {
				component: "Displays a card with header, content, and footer.",
			},
		},
	},
} satisfies Meta<typeof Card>;

export const Default: Story<typeof Card> = {
	render: () => {
		const notifications = [
			{
				title: "Your call has been confirmed.",
				description: "1 hour ago",
			},
			{
				title: "You have a new message!",
				description: "1 hour ago",
			},
			{
				title: "Your subscription is expiring soon!",
				description: "2 hours ago",
			},
		];

		return (
			<Card class="w-96">
				<CardHeader>
					<CardTitle>Notifications</CardTitle>
					<CardDescription>
						You have 3 unread messages.
					</CardDescription>
				</CardHeader>
				<CardContent class="grid gap-4">
					<div class=" flex items-center space-x-4 rounded-md border p-4">
						<BellIcon class="h-4 w-4" />
						<div class="flex-1 space-y-1">
							<p class="text-sm font-medium leading-none">
								Push Notifications
							</p>
							<p class="text-sm text-muted-foreground">
								Send notifications to device.
							</p>
						</div>
					</div>
					<div>
						<For each={notifications}>
							{notification => (
								<div class="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
									<span class="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
									<div class="space-y-1">
										<p class="text-sm font-medium leading-none">
											{notification.title}
										</p>
										<p class="text-sm text-muted-foreground">
											{notification.description}
										</p>
									</div>
								</div>
							)}
						</For>
					</div>
				</CardContent>
				<CardFooter>
					<Button class="w-full">
						<Check class="mr-2 h-4 w-4" />
						Mark all as read
					</Button>
				</CardFooter>
			</Card>
		);
	},
};
