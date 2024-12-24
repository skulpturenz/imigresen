import {
	createSolidTable,
	flexRender,
	// eslint-disable-next-line import/named
	getCoreRowModel,
	type ColumnDef,
} from "@tanstack/solid-table";
import { For, Show } from "solid-js";
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
			<DataTable
				columns={columns}
				data={queries.passportApplications.data}
			/>
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
														header.column.columnDef
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
								data-state={row.getIsSelected() && "selected"}>
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
	);
};
