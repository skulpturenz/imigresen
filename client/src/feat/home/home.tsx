import {
	createSolidTable,
	flexRender,
	// eslint-disable-next-line import/named
	getCoreRowModel,
	getPaginationRowModel,
	type ColumnDef,
} from "@tanstack/solid-table";
import { For, Show } from "solid-js";
import { Button } from "ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "ui/table";
import { usePassportApplications } from "./hooks/usePassportApplications";
import type { PassportApplication } from "./types";

export const Home = () => {
	const { queries } = usePassportApplications();

	const columns: ColumnDef<PassportApplication>[] = [
		{
			accessorKey: "principalApplicant",
			header: "Principal Applicant",
		},
		{
			accessorKey: "applicationType",
			header: "Type",
		},
		{
			accessorKey: "applicationUuid",
			header: "ID",
		},
		{
			accessorKey: "status",
			header: "Status",
		},
		{
			accessorKey: "submittedOn",
			header: "Submitted",
			cell: props => props.getValue<Date>().toLocaleString(),
		},
	];

	return (
		<Show when={!queries.passportApplications.isLoading}>
			<div class="bg-background">
				<DataTable
					columns={columns}
					data={queries.passportApplications.data}
				/>
			</div>
		</Show>
	);
};

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[] | undefined;
}

const DataTable = <TData, TValue>(props: DataTableProps<TData, TValue>) => {
	const table = createSolidTable({
		get data() {
			return props.data || [];
		},
		columns: props.columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div class="flex flex-col gap-4">
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
									colSpan={props.columns.length}
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
													cell.column.columnDef.cell,
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

			<div class="flex justify-between">
				<div>
					{(table.getState().pagination.pageIndex ?? 0) + 1} of{" "}
					{table.getPageCount()}
				</div>
				<div class="flex justify-end gap-4">
					<Button
						variant="outline"
						size="sm"
						onClick={table.previousPage}
						disabled={!table.getCanPreviousPage()}>
						Previous
					</Button>

					<Button
						variant="outline"
						size="sm"
						onClick={table.nextPage}
						disabled={!table.getCanNextPage()}>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};
