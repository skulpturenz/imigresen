import {
	createSolidTable,
	flexRender,
	// eslint-disable-next-line import/named
	getCoreRowModel,
	// eslint-disable-next-line import/named
	getFilteredRowModel,
	// eslint-disable-next-line import/named
	getPaginationRowModel,
	// eslint-disable-next-line import/named
	getSortedRowModel,
	type ColumnDef,
	type PaginationState,
	type Row,
	type RowSelectionState,
	type SortingState,
} from "@tanstack/solid-table";
import { useI18n } from "core/context/i18n";
import { flow } from "es-toolkit";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-solid";
import {
	createSignal,
	For,
	Match,
	mergeProps,
	Show,
	Switch,
	type Accessor,
} from "solid-js";
import { Button } from "ui/button";
import { Checkbox, CheckboxControl } from "ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "ui/table";
import { withI18n } from "./resources";
import type { resources } from "./resources/i18n/en-us";

export interface DataTableProps<TRow> {
	columns: ColumnDef<TRow>[];
	rows: Accessor<TRow[] | undefined>;
	initialSort?: SortingState;
	initialPageSize?: number;
	isRowSelectable?: boolean;
	pageSizeOptions?: number[];
}

interface CellContext<TRow> {
	row: Row<TRow>;
}

export const DataTableWithoutI18n = <TRow,>(props: DataTableProps<TRow>) => {
	const t = useI18n<typeof resources>();
	const pageSizeOptions = [10, 20, 30, 40, 50];

	const withDefaults = mergeProps<Partial<DataTableProps<TRow>>[]>(
		{
			isRowSelectable: true,
			pageSizeOptions,
			initialPageSize: pageSizeOptions.at(1),
		},
		props,
	) as DataTableProps<TRow>;

	const [rowSelection, setRowSelection] = createSignal<RowSelectionState>(
		Object.create(null),
	);
	const [pagination, setPagination] = createSignal<PaginationState>({
		pageIndex: 0,
		pageSize:
			withDefaults.pageSizeOptions?.find(
				size => size === withDefaults.initialPageSize,
			) ?? (withDefaults.pageSizeOptions?.at(0) as number),
	});
	const [sorting, setSorting] = createSignal<SortingState>(
		withDefaults.initialSort ?? [],
	);

	const getColumns = () => {
		const toSortableColumn = (column: ColumnDef<TRow>): ColumnDef<TRow> => {
			return {
				...column,
				header: props => {
					return (
						<Button
							variant="ghost"
							class="w-full"
							onClick={() =>
								props.column.toggleSorting(
									props.column.getIsSorted() === "asc",
								)
							}>
							<Show when={typeof column.header !== "function"}>
								{column.header as any}
							</Show>
							<Show when={typeof column.header === "function"}>
								{(column.header as any)(props)}
							</Show>

							<Switch
								fallback={
									<ArrowUpDown class="text-muted-foreground/50 size-4" />
								}>
								<Match
									when={props.column.getIsSorted() === "asc"}>
									<ArrowUp class="text-muted-foreground/50 size-4" />
								</Match>

								<Match
									when={
										props.column.getIsSorted() === "desc"
									}>
									<ArrowDown class="text-muted-foreground/50 size-4" />
								</Match>
							</Switch>
						</Button>
					);
				},
			} as ColumnDef<TRow>;
		};

		const columnTransforms = [toSortableColumn];

		const transformedColumns = withDefaults.columns.map(
			flow(...columnTransforms),
		);

		if (withDefaults.isRowSelectable) {
			const columnSelectAllRows: ColumnDef<TRow> = {
				id: "select",
				header: props => {
					return (
						<>
							<Checkbox
								checked={props.table.getIsAllRowsSelected()}
								indeterminate={props.table.getIsSomeRowsSelected()}
								onChange={props.table.toggleAllRowsSelected}>
								<CheckboxControl />
							</Checkbox>
						</>
					);
				},
				cell: (props: CellContext<TRow>) => {
					return (
						<>
							<Checkbox
								checked={props.row.getIsSelected()}
								disabled={!props.row.getCanSelect()}
								indeterminate={props.row.getIsSomeSelected()}
								onChange={props.row.toggleSelected}>
								<CheckboxControl />
							</Checkbox>
						</>
					);
				},
			};

			return [columnSelectAllRows, ...transformedColumns];
		}

		return transformedColumns;
	};

	const table = createSolidTable({
		get data() {
			return withDefaults.rows() ?? [];
		},
		state: {
			get rowSelection() {
				return rowSelection();
			},
			get pagination() {
				return pagination();
			},
			get sorting() {
				return sorting();
			},
		},
		get columns() {
			return getColumns();
		},
		enableRowSelection: withDefaults.isRowSelectable,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		debugTable: import.meta.env.DEV,
	});

	const onChangePage = (page: number | null) => {
		const newPageIdx = (page ?? 1) - 1;

		if (table.getState().pagination.pageIndex !== newPageIdx) {
			table.setPageIndex((page ?? 1) - 1);
		}
	};

	const onChangePageSize = (pageSize: number | null) => {
		const newPageSize = (pageSize ??
			withDefaults.initialPageSize) as number;

		if (table.getState().pagination.pageSize !== newPageSize) {
			table.setPageSize(newPageSize);
		}
	};

	return (
		<>
			<Table>
				<TableHeader>
					<For each={table.getHeaderGroups()}>
						{headerGroup => (
							<TableRow>
								<For each={headerGroup.headers}>
									{header => {
										return (
											<TableHead>
												<Show
													when={
														!header.isPlaceholder
													}>
													{flexRender(
														header.column.columnDef
															.header,
														header.getContext(),
													)}
												</Show>
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
									{t("noResults")}
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
			<div class="flex justify-between gap-40 py-4 items-center">
				<div class="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						{t("doPreviousPage")}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}>
						{t("doNextPage")}
					</Button>
				</div>

				<div class="flex items-center space-x-2">
					<Select
						options={Array.from(
							{ length: table.getPageCount() },
							(_, i) => i + 1,
						)}
						placeholder={t("pageOptionPlaceholder")}
						defaultValue={table.getState().pagination.pageIndex + 1}
						onChange={onChangePage}
						itemComponent={props => (
							<SelectItem item={props.item}>
								{t("page", props.item.rawValue)}
							</SelectItem>
						)}>
						<SelectTrigger class="w-36">
							<SelectValue<number>>
								{state => t("page", state.selectedOption())}
							</SelectValue>
						</SelectTrigger>
						<SelectContent />
					</Select>

					<Select
						options={withDefaults.pageSizeOptions as number[]}
						defaultValue={table.getState().pagination.pageSize}
						onChange={onChangePageSize}
						placeholder={t("pageSizeOptionPlaceholder")}
						itemComponent={props => (
							<SelectItem item={props.item}>
								{t("rows", props.item.rawValue)}
							</SelectItem>
						)}>
						<SelectTrigger class="w-36">
							<SelectValue<number>>
								{state => t("rows", state.selectedOption())}
							</SelectValue>
						</SelectTrigger>
						<SelectContent />
					</Select>
				</div>
			</div>
		</>
	);
};

export const DataTable = withI18n(DataTableWithoutI18n);
