import { randWord } from "@ngneat/falso";
import { type ColumnDef } from "@tanstack/solid-table";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Table } from "ui/table";
import { DataTable } from "./data-table";

export default {
	title: "ui/table",
	parameters: {
		docs: {
			description: {
				component: "A responsive table component",
			},
		},
	},
} satisfies Meta<typeof Table>;

export const Default: Story<typeof Table> = {
	render: () => {
		const tasks = Array.from({ length: 500 }, (_, i) => ({
			id: "ptL0KpX_yRMI98JFr6B3n",
			code: `ROW-${i + 1}`,
			title: `Row ${i + 1}`,
			status: "todo",
			label: "bug",
			search: randWord(),
		}));

		const columns: ColumnDef<(typeof tasks)[number]>[] = [
			{
				accessorKey: "code",
				header: "Task",
			},
			{
				accessorKey: "title",
				header: "Title",
			},
			{
				accessorKey: "status",
				header: "Status",
			},
			{
				accessorKey: "search",
				header: "Search",
			},
		];

		return <DataTable columns={columns} rows={() => tasks} />;
	},
};
