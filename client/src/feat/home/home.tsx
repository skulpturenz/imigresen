import {
	createSolidTable,
	flexRender,
	// eslint-disable-next-line import/named
	getCoreRowModel,
	type ColumnDef,
} from "@tanstack/solid-table";
import { For, Show, type Accessor } from "solid-js";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "ui/table";

export const Home = () => <span class="font-bold text-4xl">Here!!</span>;

type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: Accessor<TData[] | undefined>;
};

const _DataTable = <TData, TValue>(props: DataTableProps<TData, TValue>) => {
	const table = createSolidTable({
		get data() {
			return props.data() || [];
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
