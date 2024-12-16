import { Index } from "solid-js";
import { Portal } from "solid-js/web";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
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

export default {
	title: "ui/date-picker",
	component: DatePicker,
	parameters: {
		docs: {
			description: {
				component: "A date picker component with range and presets",
			},
		},
	},
} satisfies Meta<typeof DatePicker>;

export const Default: Story<typeof DatePicker> = {
	render: () => (
		<DatePicker>
			<DatePickerControl>
				<DatePickerInput placeholder="MM/DD/YYYY" />
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
	),
};
