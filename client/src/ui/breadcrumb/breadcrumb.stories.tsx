import type { Meta, StoryObj as Story } from "storybook-solidjs";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "ui/breadcrumb";

export default {
	title: "ui/breadcrumb",
	parameters: {
		docs: {
			description: {
				component:
					"Displays the path to the current resource using a hierarchy of links",
			},
		},
	},
} satisfies Meta<typeof Breadcrumb>;

export const Default: Story<typeof Breadcrumb> = {
	render: () => (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink>Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbEllipsis class="h-4 w-4" />
					<span class="sr-only">Toggle menu</span>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink>Components</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	),
};
