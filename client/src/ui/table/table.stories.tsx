import {
	createSolidTable,
	flexRender,
	// eslint-disable-next-line import/named
	getCoreRowModel,
	type ColumnDef,
} from "@tanstack/solid-table";
import { For, Show, splitProps, type Accessor } from "solid-js";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "ui/table";

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

		type Props<TData, TValue> = {
			columns: ColumnDef<TData, TValue>[];
			data: Accessor<TData[] | undefined>;
		};

		const DataTable = <TData, TValue>(props: Props<TData, TValue>) => {
			const [local] = splitProps(props, ["columns", "data"]);

			const table = createSolidTable({
				get data() {
					return local.data() || [];
				},
				columns: local.columns,
				getCoreRowModel: getCoreRowModel(),
			});

			return (
				<Table>
					<TableHeader>
						<For each={table.getHeaderGroups()}>
							{headerGroup => (
								<TableRow>
									<For each={headerGroup.headers}>
										{header => {
											return (
												<TableHead>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column
																	.columnDef
																	.header,
																header.getContext(),
															)}
												</TableHead>
											);
										}}
									</For>
								</TableRow>
							)}
						</For>
					</TableHeader>
					<TableBody>
						<Show
							when={table.getRowModel().rows?.length}
							fallback={
								<TableRow>
									<TableCell
										colSpan={local.columns.length}
										class="h-24 text-center">
										No results.
									</TableCell>
								</TableRow>
							}>
							<For each={table.getRowModel().rows}>
								{row => (
									<TableRow
										data-state={
											row.getIsSelected() && "selected"
										}>
										<For each={row.getVisibleCells()}>
											{cell => (
												<TableCell>
													{flexRender(
														cell.column.columnDef
															.cell,
														cell.getContext(),
													)}
												</TableCell>
											)}
										</For>
									</TableRow>
								)}
							</For>
						</Show>
					</TableBody>
				</Table>
			);
		};

		return <DataTable columns={columns} data={() => tasks} />;
	},
};
