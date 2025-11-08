import {
	cleanup,
	render,
	/* eslint-disable-next-line */
	screen,
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

	it.todo("ref can be focused");

	it.todo("ref can be clicked");

	it.todo("ref can be blurred");
});
