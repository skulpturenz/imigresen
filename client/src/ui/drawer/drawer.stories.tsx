import { Minus, Plus } from "lucide-solid";
import { createSignal } from "solid-js";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Button } from "ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerLabel,
	DrawerTrigger,
} from "ui/drawer";

export default {
	title: "ui/drawer",
	component: Drawer,
	parameters: {
		docs: {
			description: {
				component:
					"A draggable dialog that is attached to any side of the viewport",
			},
		},
	},
} satisfies Meta<typeof Drawer>;

export const Default: Story<typeof Drawer> = {
	render: () => {
		const [goal, setGoal] = createSignal(350);

		const onClick = (adjustment: number) => {
			setGoal(Math.max(200, Math.min(400, goal() + adjustment)));
		};

		return (
			<Drawer>
				<DrawerTrigger as={Button} variant="outline">
					Open Drawer
				</DrawerTrigger>
				<DrawerContent>
					<div class="mx-auto w-full max-w-sm">
						<DrawerHeader>
							<DrawerLabel>Move Goal</DrawerLabel>
							<DrawerDescription>
								Set your daily activity goal.
							</DrawerDescription>
						</DrawerHeader>
						<div class="p-4 pb-0">
							<div class="flex items-center justify-center space-x-2">
								<Button
									variant="outline"
									size="icon"
									class="h-8 w-8 shrink-0 rounded-full"
									onClick={() => onClick(-10)}
									disabled={goal() <= 200}>
									<Minus class="h-4 w-4" />
									<span class="sr-only">Decrease</span>
								</Button>
								<div class="flex-1 text-center">
									<div class="text-7xl font-bold tracking-tighter">
										{goal()}
									</div>
									<div class="text-[0.70rem] uppercase text-muted-foreground">
										Calories/day
									</div>
								</div>
								<Button
									variant="outline"
									size="icon"
									class="h-8 w-8 shrink-0 rounded-full"
									onClick={() => onClick(10)}
									disabled={goal() >= 400}>
									<Plus class="h-4 w-4" />
									<span class="sr-only">Increase</span>
								</Button>
							</div>
						</div>
						<DrawerFooter>
							<Button>Submit</Button>
							<DrawerClose as={Button} variant="outline">
								Cancel
							</DrawerClose>
						</DrawerFooter>
					</div>
				</DrawerContent>
			</Drawer>
		);
	},
};
