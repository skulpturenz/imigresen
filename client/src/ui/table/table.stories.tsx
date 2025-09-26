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
		const tasks = [
			{
				id: "ptL0KpX_yRMI98JFr6B3n",
				code: "TASK-33",
				title: "We need to bypass the redundant AI interface!",
				status: "todo",
				label: "bug",
			},
			{
				id: "RsrTg_SmBKPKwbUlr7Ztv",
				code: "TASK-59",
				title: "Overriding the capacitor won't do anything, we need to generate the solid state JBOD pixel!",
				status: "in-progress",
				label: "feature",
			},
		];

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
		];

		return <DataTable columns={columns} rows={() => tasks} />;
	},
};
