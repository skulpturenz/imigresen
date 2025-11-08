import {
	cleanup,
	/* eslint-disable-next-line */
	fireEvent,
	render,
	/* eslint-disable-next-line */
	screen,
	/* eslint-disable-next-line */
	waitFor,
} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	DatePicker,
	DatePickerControl,
	DatePickerInput,
	DatePickerTrigger,
} from ".";

describe.sequential("<DatePicker />", () => {
	beforeAll(() => {
		userEvent.setup();
	});

	afterEach(() => {
		cleanup();
	});

	it("emits an input event when a new date is selected", async () => {
		const onInput = vi.fn();

		render(() => (
			<DatePicker onInput={onInput}>
				<DatePickerControl>
					<DatePickerInput data-testid="datepicker-input" />

					<DatePickerTrigger data-testid="datepicker-trigger" />
				</DatePickerControl>
			</DatePicker>
		));

		const datePickerInput =
			await screen.findByTestId<HTMLInputElement>("datepicker-input");

		await userEvent.click(datePickerInput);
		await userEvent.type(datePickerInput, "01/01/2025");
		await userEvent.click(document.body);

		expect(onInput).toBeCalledTimes(1);
	});

	it("ref can be focused", async () => {
		let ref: HTMLInputElement | undefined;

		render(() => (
			<DatePicker
				ref={element => {
					ref = element;
				}}>
				<DatePickerControl>
					<DatePickerInput data-testid="datepicker-input" />

					<DatePickerTrigger data-testid="datepicker-trigger" />
				</DatePickerControl>
			</DatePicker>
		));

		expect(ref).toBeTruthy();
		ref?.focus();

		const datePickerInput =
			await screen.findByTestId<HTMLInputElement>("datepicker-input");
		expect(document.activeElement).toBe(datePickerInput);
	});

	it("ref can be clicked", async () => {
		let ref: HTMLInputElement | undefined;

		render(() => (
			<DatePicker
				ref={element => {
					ref = element;
				}}
				data-testid="datepicker-root">
				<DatePickerControl>
					<DatePickerInput data-testid="datepicker-input" />

					<DatePickerTrigger data-testid="datepicker-trigger" />
				</DatePickerControl>
			</DatePicker>
		));

		expect(ref).toBeTruthy();
		fireEvent.click(ref as HTMLInputElement);

		const datePickerInput =
			await screen.findByTestId<HTMLInputElement>("datepicker-input");
		await waitFor(() =>
			expect(document.activeElement).toBe(datePickerInput),
		);

		const datePickerRoot = await screen.findByTestId("datepicker-root");
		expect(datePickerRoot.getAttribute("data-state")).toBe("open");
	});

	it("ref can be blurred", async () => {
		let ref: HTMLInputElement | undefined;

		render(() => (
			<DatePicker
				ref={element => {
					ref = element;
				}}>
				<DatePickerControl>
					<DatePickerInput data-testid="datepicker-input" />

					<DatePickerTrigger data-testid="datepicker-trigger" />
				</DatePickerControl>
			</DatePicker>
		));

		expect(ref).toBeTruthy();
		fireEvent.focus(ref as HTMLInputElement);

		const datePickerInput =
			await screen.findByTestId<HTMLInputElement>("datepicker-input");
		expect(document.activeElement).toBe(datePickerInput);

		fireEvent.blur(ref as HTMLInputElement);
		expect(document.activeElement).not.toBe(datePickerInput);
	});
});
