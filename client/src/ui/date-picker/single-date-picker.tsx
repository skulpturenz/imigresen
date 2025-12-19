import { Index, splitProps, type Component, type ParentProps } from "solid-js";
import { Portal } from "solid-js/web";
import {
	DatePicker,
	DatePickerContent,
	DatePickerContext,
	DatePickerControl,
	DatePickerInput,
	DatePickerPositioner,
	DatePickerRangeText,
	DatePickerTable,
	DatePickerTableBody,
	DatePickerTableCell,
	DatePickerTableCellTrigger,
	DatePickerTableHead,
	DatePickerTableHeader,
	DatePickerTableRow,
	DatePickerTrigger,
	DatePickerView,
	DatePickerViewControl,
	DatePickerViewTrigger,
	type SingleDatePickerProps as DatePickerProps,
} from "ui/date-picker";

export interface SingleDatePickerProps
	extends Omit<DatePickerProps, "selectionMode"> {
	placeholder?: string;
	autocomplete?: string;
	testIds?: {
		control?: string;
		input?: string;
		trigger?: string;
		content?: string;
	};
}

export const SingleDatePicker: Component<
	ParentProps<SingleDatePickerProps>
> = props => {
	const [inputProps, testing, rest] = splitProps(
		props,
		["placeholder", "autocomplete"],
		["testIds"],
	);

	const DayView = () => (
		<DatePickerView view="day">
			<DatePickerContext>
				{context => (
					<>
						<DatePickerViewControl>
							<DatePickerViewTrigger>
								<DatePickerRangeText />
							</DatePickerViewTrigger>
						</DatePickerViewControl>
						<DatePickerTable>
							<DatePickerTableHead>
								<DatePickerTableRow>
									<Index each={context().weekDays}>
										{weekDay => (
											<DatePickerTableHeader>
												{weekDay().short}
											</DatePickerTableHeader>
										)}
									</Index>
								</DatePickerTableRow>
							</DatePickerTableHead>
							<DatePickerTableBody>
								<Index each={context().weeks}>
									{week => (
										<DatePickerTableRow>
											<Index each={week()}>
												{day => (
													<DatePickerTableCell
														value={day()}>
														<DatePickerTableCellTrigger>
															{day().day}
														</DatePickerTableCellTrigger>
													</DatePickerTableCell>
												)}
											</Index>
										</DatePickerTableRow>
									)}
								</Index>
							</DatePickerTableBody>
						</DatePickerTable>
					</>
				)}
			</DatePickerContext>
		</DatePickerView>
	);

	const MonthView = () => (
		<DatePickerView view="month">
			<DatePickerContext>
				{context => (
					<>
						<DatePickerViewControl>
							<DatePickerViewTrigger>
								<DatePickerRangeText />
							</DatePickerViewTrigger>
						</DatePickerViewControl>
						<DatePickerTable>
							<DatePickerTableBody>
								<Index
									each={context().getMonthsGrid({
										columns: 4,
										format: "short",
									})}>
									{months => (
										<DatePickerTableRow>
											<Index each={months()}>
												{month => (
													<DatePickerTableCell
														value={month().value}>
														<DatePickerTableCellTrigger>
															{month().label}
														</DatePickerTableCellTrigger>
													</DatePickerTableCell>
												)}
											</Index>
										</DatePickerTableRow>
									)}
								</Index>
							</DatePickerTableBody>
						</DatePickerTable>
					</>
				)}
			</DatePickerContext>
		</DatePickerView>
	);

	const YearView = () => (
		<DatePickerView view="year">
			<DatePickerContext>
				{context => (
					<>
						<DatePickerViewControl>
							<DatePickerViewTrigger>
								<DatePickerRangeText />
							</DatePickerViewTrigger>
						</DatePickerViewControl>
						<DatePickerTable>
							<DatePickerTableBody>
								<Index
									each={context().getYearsGrid({
										columns: 4,
									})}>
									{years => (
										<DatePickerTableRow>
											<Index each={years()}>
												{year => (
													<DatePickerTableCell
														value={year().value}>
														<DatePickerTableCellTrigger>
															{year().label}
														</DatePickerTableCellTrigger>
													</DatePickerTableCell>
												)}
											</Index>
										</DatePickerTableRow>
									)}
								</Index>
							</DatePickerTableBody>
						</DatePickerTable>
					</>
				)}
			</DatePickerContext>
		</DatePickerView>
	);

	return (
		<DatePicker {...rest} selectionMode="single">
			<DatePickerControl
				class="w-full"
				data-testid={testing.testIds?.control}>
				<DatePickerInput
					{...inputProps}
					data-testid={testing.testIds?.input}
				/>
				<DatePickerTrigger data-testid={testing.testIds?.trigger} />
			</DatePickerControl>
			<Portal>
				<DatePickerPositioner>
					<DatePickerContent data-testid={testing.testIds?.content}>
						<DayView />
						<MonthView />
						<YearView />
					</DatePickerContent>
				</DatePickerPositioner>
			</Portal>

			{props.children}
		</DatePicker>
	);
};
