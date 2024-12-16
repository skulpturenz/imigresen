import type { DropdownMenuSubTriggerProps } from "@kobalte/core/dropdown-menu";
import {
	Cloud,
	CreditCard,
	Keyboard,
	LifeBuoy,
	LogOut,
	Mail,
	MessageSquare,
	Plus,
	PlusCircle,
	Settings,
	User,
	UserPlus,
} from "lucide-solid";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Button } from "ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupLabel,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "ui/dropdown-menu";

export default {
	title: "ui/dropdown-menu",
	parameters: {
		docs: {
			description: {
				component:
					"Displays a menu to the user — such as a set of actions or functions — triggered by a button",
			},
		},
	},
} satisfies Meta<typeof DropdownMenu>;

export const Default: Story<typeof DropdownMenu> = {
	render: () => (
		<DropdownMenu placement="right">
			<DropdownMenuTrigger
				as={(props: DropdownMenuSubTriggerProps) => (
					<Button variant="outline" {...props}>
						Open
					</Button>
				)}
			/>
			<DropdownMenuContent class="w-56">
				<DropdownMenuGroup>
					<DropdownMenuGroupLabel>My Account</DropdownMenuGroupLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<User class="mr-2" />
						<span>Profile</span>
						<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCard class="mr-2" />
						<span>Billing</span>
						<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Settings class="mr-2" />
						<span>Settings</span>
						<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Keyboard class="mr-2" />
						<span>Keyboard shortcuts</span>
						<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<User class="mr-2" />
						<span>Team</span>
					</DropdownMenuItem>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<UserPlus class="h-6 w-6 mr-2" />
							<span>Invite users</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem>
								<Mail class="mr-2" />
								<span>Email</span>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<MessageSquare class="mr-2" />
								<span>Message</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<PlusCircle class="mr-2" />
								<span>More...</span>
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
					<DropdownMenuItem>
						<Plus class="mr-2" />
						<span>New Team</span>
						<DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<LifeBuoy class="mr-2" />
					<span>Support</span>
				</DropdownMenuItem>
				<DropdownMenuItem disabled>
					<Cloud class="mr-2" />
					<span>API</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup>
					<DropdownMenuRadioItem value="top">
						Top
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="bottom">
						Bottom
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="right">
						Right
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
				<DropdownMenuSeparator />
				<DropdownMenuCheckboxItem>Status Bar</DropdownMenuCheckboxItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<LogOut class="mr-2" />
					<span>Log out</span>
					<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};
