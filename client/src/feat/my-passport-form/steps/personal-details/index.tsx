import { Index } from "solid-js";
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
import { Label } from "ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "ui/select";
import {
	TextField,
	TextFieldDescription,
	TextFieldErrorMessage,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export const PersonalDetails = () => {
	return (
		<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
			<div class="col-span-full">
				<TextFieldRoot class="space-y-2" validationState="invalid">
					<TextFieldLabel>First name</TextFieldLabel>

					<TextField class="mt-2" type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>

			<div class="col-span-full">
				<TextFieldRoot>
					<TextFieldLabel>Last name</TextFieldLabel>
					<TextField type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>

			<div>
				<TextFieldRoot>
					<TextFieldLabel>Phone number</TextFieldLabel>
					<TextField type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>

			<div>
				<TextFieldRoot>
					<TextFieldLabel>Email address</TextFieldLabel>
					<TextField type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>

			<div>
				<Label>Date of birth</Label>

				<DatePicker>
					<DatePickerControl class="w-full">
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
																	context()
																		.weekDays
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
														<Index
															each={
																context().weeks
															}>
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
			</div>

			<div>
				<Label>Nationality</Label>
				<Select
					options={[
						"Apple",
						"Banana",
						"Blueberry",
						"Grapes",
						"Pineapple",
					]}
					placeholder="Select a fruit…"
					itemComponent={props => (
						<SelectItem item={props.item}>
							{props.item.rawValue}
						</SelectItem>
					)}>
					<SelectTrigger>
						<SelectValue<string>>
							{state => state.selectedOption()}
						</SelectValue>
					</SelectTrigger>
					<SelectContent />
				</Select>
			</div>

			<div class="col-span-1">
				<Label>Gender</Label>
				<Select
					options={[
						"Apple",
						"Banana",
						"Blueberry",
						"Grapes",
						"Pineapple",
					]}
					placeholder="Select a fruit…"
					itemComponent={props => (
						<SelectItem item={props.item}>
							{props.item.rawValue}
						</SelectItem>
					)}>
					<SelectTrigger>
						<SelectValue<string>>
							{state => state.selectedOption()}
						</SelectValue>
					</SelectTrigger>
					<SelectContent />
				</Select>
			</div>

			<div>
				<TextFieldRoot>
					<TextFieldLabel>Height</TextFieldLabel>
					<TextField type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>

			<div>
				<Label>Maritial status</Label>
				<Select
					options={[
						"Apple",
						"Banana",
						"Blueberry",
						"Grapes",
						"Pineapple",
					]}
					placeholder="Select a fruit…"
					itemComponent={props => (
						<SelectItem item={props.item}>
							{props.item.rawValue}
						</SelectItem>
					)}>
					<SelectTrigger>
						<SelectValue<string>>
							{state => state.selectedOption()}
						</SelectValue>
					</SelectTrigger>
					<SelectContent />
				</Select>
			</div>
		</div>
	);
};
