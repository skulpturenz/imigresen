import {
	parseDate,
	type DatePickerRootProps,
	type DatePickerValueChangeDetails,
} from "@ark-ui/solid/date-picker";
import { parse } from "date-fns";
import { invariant } from "es-toolkit";
import { Index, type Component } from "solid-js";
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
} from "ui/date-picker";

export interface DateRangePickerProps
	extends Omit<DatePickerRootProps, "value" | "onChange"> {
	value?: Date | null;
	onChange?: (date: Date | null) => void;
	placeholder?: string;
	autocomplete?: string;
}

export const DateRangePicker: Component<DateRangePickerProps> = props => {
	const onChange = (details?: DatePickerValueChangeDetails) => {
		if (!details?.valueAsString.length) {
			props.onChange?.(null);

			return;
		}

		const selectedDate = details.valueAsString.at(0);

		invariant(selectedDate, "Selected date is not specified");

		const parsedDate = parse(selectedDate ?? "", "dd/MM/yyyy", new Date());

		if (!import.meta.env.PROD) {
			console.debug("parsed date", parsedDate);
		}

		props.onChange?.(parse(selectedDate ?? "", "dd/MM/yyyy", new Date()));
	};

	const getValue = () => {
		if (!props.value || !(props.value instanceof Date)) {
			return;
		}

		return [parseDate(props.value)];
	};

	return (
		<DatePicker value={getValue()} onValueChange={onChange}>
			<DatePickerControl class="w-full">
				<DatePickerInput
					autocomplete={props.autocomplete}
					placeholder={props.placeholder}
				/>
				<DatePickerTrigger />
			</DatePickerControl>
			<Portal>
				<DatePickerPositioner>
					<DatePickerContent>
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
													<Index
														each={
															context().weekDays
														}>
														{weekDay => (
															<DatePickerTableHeader>
																{
																	weekDay()
																		.short
																}
															</DatePickerTableHeader>
														)}
													</Index>
												</DatePickerTableRow>
											</DatePickerTableHead>
											<DatePickerTableBody>
												<Index each={context().weeks}>
													{week => (
														<DatePickerTableRow>
															<Index
																each={week()}>
																{day => (
																	<DatePickerTableCell
																		value={day()}>
																		<DatePickerTableCellTrigger>
																			{
																				day()
																					.day
																			}
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
													each={context().getMonthsGrid(
														{
															columns: 4,
															format: "short",
														},
													)}>
													{months => (
														<DatePickerTableRow>
															<Index
																each={months()}>
																{month => (
																	<DatePickerTableCell
																		value={
																			month()
																				.value
																		}>
																		<DatePickerTableCellTrigger>
																			{
																				month()
																					.label
																			}
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
													each={context().getYearsGrid(
														{
															columns: 4,
														},
													)}>
													{years => (
														<DatePickerTableRow>
															<Index
																each={years()}>
																{year => (
																	<DatePickerTableCell
																		value={
																			year()
																				.value
																		}>
																		<DatePickerTableCellTrigger>
																			{
																				year()
																					.label
																			}
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
					</DatePickerContent>
				</DatePickerPositioner>
			</Portal>
		</DatePicker>
	);
};
