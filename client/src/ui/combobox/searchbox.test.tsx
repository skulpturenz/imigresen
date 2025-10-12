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
import { memoize } from "es-toolkit";
import { uniqueId as _uniqueId } from "es-toolkit/compat";
import { createSignal, For } from "solid-js";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	ComboboxClearSelection,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
	type ComboboxInputValueChangeDetails,
} from "./combobox";
import { Searchbox } from "./searchbox";

describe.sequential("<Searchbox />", () => {
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			disconnect() {}
			unobserve() {}
		},
	);

	const uniqueId = memoize(_uniqueId);

	beforeAll(() => {
		userEvent.setup();
	});

	afterEach(() => {
		cleanup();
		uniqueId.cache.clear();
	});

	describe("can be controlled", () => {
		it("with options", async () => {
			const options = ["a", "b"];
			render(() => (
				<Searchbox options={options} value={"b"}>
					<ComboboxTrigger>
						<ComboboxInput
							data-testid={uniqueId("combobox-input")}
						/>
					</ComboboxTrigger>

					<ComboboxContent>
						<For each={options}>
							{(item: string) => (
								<ComboboxItem
									item={item}
									data-testid={uniqueId(
										`combobox-item-${item}`,
									)}>
									{item}
								</ComboboxItem>
							)}
						</For>
					</ComboboxContent>
				</Searchbox>
			));

			const unchecked = await screen.findByTestId<HTMLDivElement>(
				uniqueId("combobox-item-a"),
			);
			expect(unchecked.getAttribute("data-state")).not.toBe("checked");

			const checked = await screen.findByTestId<HTMLDivElement>(
				uniqueId("combobox-item-b"),
			);
			expect(checked.getAttribute("data-state")).toBe("checked");

			const comboboxInput = await screen.findByTestId<HTMLInputElement>(
				uniqueId("combobox-input"),
			);
			expect(comboboxInput.value).toBe("b");
		});

		it("without options", async () => {
			const options = [] as string[];
			render(() => (
				<Searchbox options={options} value={"b"}>
					<ComboboxTrigger>
						<ComboboxInput
							data-testid={uniqueId("combobox-input")}
						/>
					</ComboboxTrigger>

					<ComboboxContent>
						<For each={options}>
							{(item: string) => (
								<ComboboxItem
									item={item}
									data-testid={uniqueId(
										`combobox-item-${item}`,
									)}>
									{item}
								</ComboboxItem>
							)}
						</For>
					</ComboboxContent>
				</Searchbox>
			));

			const comboboxInput = await screen.findByTestId<HTMLInputElement>(
				uniqueId("combobox-input"),
			);
			expect(comboboxInput.value).toBe("b");
		});
	});

	it("emits an event when input value is changed", async () => {
		const onInput = vi.fn();
		const options = ["a", "b"];
		render(() => (
			<Searchbox options={options} onInput={onInput}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					<For each={options}>
						{(item: string) => (
							<ComboboxItem
								item={item}
								data-testid={uniqueId(`combobox-item-${item}`)}>
								{item}
							</ComboboxItem>
						)}
					</For>
				</ComboboxContent>
			</Searchbox>
		));

		const comboboxTrigger = await screen.findByTestId<HTMLButtonElement>(
			uniqueId("combobox-trigger"),
		);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput = await screen.findByTestId<HTMLInputElement>(
			uniqueId("combobox-input"),
		);
		fireEvent.input(comboboxInput, { target: { value: "A" } });
		expect(onInput).toBeCalledTimes(1);

		const item = await screen.findByTestId<HTMLDivElement>(
			uniqueId("combobox-item-a"),
		);
		fireEvent.click(item);

		expect(comboboxInput.value).toBe("a");
		expect(onInput).toBeCalledTimes(2);
	});

	it("allows search strings which are not valid options", async () => {
		const onInput = vi.fn();
		const options = [] as string[];
		render(() => (
			<Searchbox options={options} onInput={onInput}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					<For each={options}>
						{(item: string) => (
							<ComboboxItem
								item={item}
								data-testid={uniqueId(`combobox-item-${item}`)}>
								{item}
							</ComboboxItem>
						)}
					</For>
				</ComboboxContent>
			</Searchbox>
		));

		const comboboxTrigger = await screen.findByTestId<HTMLButtonElement>(
			uniqueId("combobox-trigger"),
		);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput = await screen.findByTestId<HTMLInputElement>(
			uniqueId("combobox-input"),
		);
		fireEvent.input(comboboxInput, { target: { value: "A" } });

		expect(comboboxInput.value).toBe("A");
		expect(onInput).toBeCalledTimes(1);
	});

	it("can be focused", async () => {
		let ref: HTMLInputElement | undefined;
		const options = [] as string[];
		render(() => (
			<Searchbox
				ref={element => {
					ref = element;
				}}
				options={options}>
				<ComboboxTrigger>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					<For each={options}>
						{(item: string) => (
							<ComboboxItem item={item}>{item}</ComboboxItem>
						)}
					</For>
				</ComboboxContent>
			</Searchbox>
		));

		expect(ref).toBeTruthy();
		await userEvent.click(ref as HTMLInputElement);

		const comboboxInput = await screen.findByTestId(
			uniqueId("combobox-input"),
		);
		expect(document.activeElement).toBe(comboboxInput);
	});

	it("can be blurred", async () => {
		let ref: HTMLInputElement | undefined;
		const options = [] as string[];
		render(() => (
			<Searchbox
				ref={element => {
					ref = element;
				}}
				options={options}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					<For each={options}>
						{(item: string) => (
							<ComboboxItem
								item={item}
								data-testid={`combobox-item-${item}`}>
								{item}
							</ComboboxItem>
						)}
					</For>
				</ComboboxContent>
			</Searchbox>
		));

		expect(ref).toBeTruthy();
		await userEvent.click(ref as HTMLInputElement);

		const comboboxInput = await screen.findByTestId(
			uniqueId("combobox-input"),
		);
		expect(document.activeElement).toBe(comboboxInput);

		await userEvent.click(document.body);
		expect(document.activeElement).not.toBe(comboboxInput);
	});

	it("can be clicked", async () => {
		let ref: HTMLInputElement | undefined;
		const options = ["a", "b"];
		render(() => (
			<Searchbox
				ref={element => {
					ref = element;
				}}
				options={options}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent data-testid={uniqueId("combobox-content")}>
					<For each={options}>
						{(item: string) => (
							<ComboboxItem
								item={item}
								data-testid={`combobox-item-${item}`}>
								{item}
							</ComboboxItem>
						)}
					</For>
				</ComboboxContent>
			</Searchbox>
		));

		expect(ref).toBeTruthy();
		await userEvent.click(ref as HTMLInputElement);

		const comboboxInput = await screen.findByTestId(
			uniqueId("combobox-input"),
		);
		expect(document.activeElement).toBe(comboboxInput);

		const comboboxContent = await screen.findByTestId(
			uniqueId("combobox-content"),
		);
		expect(comboboxContent.getAttribute("data-state")).toBe("open");
	});

	it("does not reset value when focus is lost", async () => {
		let ref: HTMLInputElement | undefined;
		render(() => {
			const [options, setOptions] = createSignal(["a", "b"]);
			// filtering options list based on `inputValue` must be done by the caller
			// - fetch options based on new input value
			// - filtering the existing list scenario is better served by a single value combobox`
			const onInputValueChange = (
				details: ComboboxInputValueChangeDetails,
			) => {
				setOptions(options =>
					options.filter(option =>
						option.includes(details.inputValue),
					),
				);
			};

			return (
				<>
					<button />
					<Searchbox
						ref={element => {
							ref = element;
						}}
						options={options()}
						onInputValueChange={onInputValueChange}>
						<ComboboxTrigger
							data-testid={uniqueId("combobox-trigger")}>
							<ComboboxInput
								data-testid={uniqueId("combobox-input")}
							/>
						</ComboboxTrigger>

						<ComboboxContent>
							<For each={options()}>
								{(item: string) => (
									<ComboboxItem
										item={item}
										data-testid={uniqueId(
											`combobox-item-${item}`,
										)}>
										{item}
									</ComboboxItem>
								)}
							</For>
						</ComboboxContent>
					</Searchbox>
				</>
			);
		});

		const comboboxTrigger = await screen.findByTestId<HTMLButtonElement>(
			uniqueId("combobox-trigger"),
		);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		await userEvent.click(ref as HTMLInputElement);
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput = await screen.findByTestId<HTMLInputElement>(
			uniqueId("combobox-input"),
		);
		await userEvent.type(comboboxInput, "a");

		const item = await screen.findByTestId<HTMLDivElement>(
			uniqueId("combobox-item-a"),
		);
		await userEvent.click(item);
		expect(comboboxInput.value).toBe("a");

		await userEvent.clear(comboboxInput);
		await userEvent.type(comboboxInput, "TEST");
		await expect(() =>
			screen.findByTestId(uniqueId("combobox-item-a")),
		).rejects.toThrow();
		expect(comboboxInput.value).toBe("TEST");

		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");
		await userEvent.tab({ shift: true });
		await userEvent.click(comboboxTrigger);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");

		await waitFor(() => expect(comboboxInput.value).toBe("TEST"));
	});

	it("can be cleared", async () => {
		const options = ["a", "b"];
		render(() => (
			<Searchbox options={["a", "b"]}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />

					<ComboboxClearSelection
						data-testid={uniqueId("combobox-clear-selection")}
					/>
				</ComboboxTrigger>

				<ComboboxContent>
					<For each={options}>
						{(item: string) => (
							<ComboboxItem
								item={item}
								data-testid={uniqueId(`combobox-item-${item}`)}>
								{item}
							</ComboboxItem>
						)}
					</For>
				</ComboboxContent>
			</Searchbox>
		));

		const comboboxTrigger = await screen.findByTestId<HTMLButtonElement>(
			uniqueId("combobox-trigger"),
		);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		await userEvent.click(comboboxTrigger);
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput = await screen.findByTestId<HTMLInputElement>(
			uniqueId("combobox-input"),
		);
		await userEvent.type(comboboxInput, "A");

		const item = await screen.findByTestId<HTMLDivElement>(
			uniqueId("combobox-item-a"),
		);
		await userEvent.click(item);

		expect(comboboxInput.value).toBe("a");

		const comboboxClearSelection =
			await screen.findByTestId<HTMLButtonElement>(
				uniqueId("combobox-clear-selection"),
			);
		await userEvent.click(comboboxClearSelection);

		expect(comboboxInput.value).toBe("");
	});
});
