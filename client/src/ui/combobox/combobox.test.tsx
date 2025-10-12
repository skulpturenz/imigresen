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
import { Show } from "solid-js";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	Combobox,
	ComboboxClearSelection,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
} from "./combobox";

describe.sequential("<Combobox />", () => {
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			disconnect() {}
			unobserve() {}
		},
	);

	const uniqueId = memoize((prefix?: string) => _uniqueId(prefix));

	beforeAll(() => {
		userEvent.setup();
	});

	afterEach(() => {
		cleanup();
		uniqueId.cache.clear();
	});

	it("emits an input event when new option is selected", async () => {
		const onInput = vi.fn();
		render(() => (
			<Combobox options={["a", "b"]} onInput={onInput}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={uniqueId(`combobox-item-${item}`)}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		const comboboxTrigger = await screen.findByTestId<HTMLButtonElement>(
			uniqueId("combobox-trigger"),
		);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");
		await expect(
			screen.findByTestId<HTMLDivElement>(uniqueId("combobox-item-a")),
		).resolves.toBeTruthy();
		await expect(
			screen.findByTestId<HTMLDivElement>(uniqueId("combobox-item-b")),
		).resolves.toBeTruthy();

		const comboboxInput = await screen.findByTestId<HTMLInputElement>(
			uniqueId("combobox-input"),
		);
		fireEvent.input(comboboxInput, { target: { value: "A" } });
		await expect(() =>
			screen.findByTestId<HTMLDivElement>(uniqueId("combobox-item-b")),
		).rejects.toThrow();

		const item = await screen.findByTestId<HTMLDivElement>(
			uniqueId("combobox-item-a"),
		);
		fireEvent.click(item);

		expect(comboboxInput.value).toBe("a");
		expect(onInput).toBeCalledTimes(1);
	});

	it("emits an input event when custom option is selected", async () => {
		const onInput = vi.fn();
		render(() => (
			<Combobox options={["a", "b"]} allowCustomValue onInput={onInput}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={uniqueId(`combobox-item-${item}`)}>
							<Show when={isNewOptionValue(item)}>
								Create {item}
							</Show>

							<Show when={!isNewOptionValue(item)}>{item}</Show>
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
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
		fireEvent.input(comboboxInput, { target: { value: "TEST" } });
		await expect(() =>
			screen.findByTestId<HTMLDivElement>(uniqueId("combobox-item-b")),
		).rejects.toThrow();
		await expect(
			screen.findByTestId(uniqueId("combobox-item-TEST")),
		).resolves.toBeTruthy();

		const item = await screen.findByTestId<HTMLDivElement>(
			uniqueId("combobox-item-TEST"),
		);
		fireEvent.click(item);

		expect(comboboxInput.value).toBe("TEST");
		expect(onInput).toBeCalledTimes(1);
	});

	it("filters options based on input value", { timeout: 10000 }, async () => {
		render(() => (
			<Combobox options={["a", "b", "SOME oPtIoN"]}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={uniqueId(`combobox-item-${item}`)}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
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
		await expect(
			screen.findByTestId(uniqueId("combobox-item-a")),
		).resolves.toBeTruthy();
		await expect(() =>
			screen.findByTestId<HTMLDivElement>(uniqueId("combobox-item-b")),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId(uniqueId("combobox-item-SOME oPtIoN")),
		).rejects.toThrow();

		fireEvent.input(comboboxInput, { target: { value: "b" } });
		await expect(
			screen.findByTestId<HTMLDivElement>(uniqueId("combobox-item-b")),
		).resolves.toBeTruthy();
		await expect(() =>
			screen.findByTestId(uniqueId("combobox-item-a")),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId(uniqueId("combobox-item-SOME oPtIoN")),
		).rejects.toThrow();

		fireEvent.input(comboboxInput, {
			target: { value: "SOME opTION" },
		});
		await expect(
			screen.findByTestId(uniqueId("combobox-item-SOME oPtIoN")),
		).resolves.toBeTruthy();
		await expect(() =>
			screen.findByTestId(uniqueId("combobox-item-a")),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId<HTMLDivElement>(uniqueId("combobox-item-b")),
		).rejects.toThrow();
	});

	it("filters options when a custom filter is specified", async () => {
		render(() => (
			<Combobox
				options={["a", "b", "SOME oPtIoN"]}
				filter={(itemText, filterText) => itemText === filterText}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={uniqueId(`combobox-item-${item}`)}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
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
		await expect(() =>
			screen.findByTestId(uniqueId("combobox-item-a")),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId<HTMLDivElement>(uniqueId("combobox-item-b")),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId(uniqueId("combobox-item-SOME oPtIoN")),
		).rejects.toThrow();
	});

	it("creates only one custom option", async () => {
		render(() => (
			<Combobox options={["a"]} allowCustomValue>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={uniqueId(`combobox-item-${item}`)}>
							<Show when={isNewOptionValue(item)}>
								Create {item}
							</Show>

							<Show when={!isNewOptionValue(item)}>{item}</Show>
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
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

		fireEvent.input(comboboxInput, { target: { value: "TEST" } });
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();

		fireEvent.input(comboboxInput, { target: { value: "test" } });
		await expect(() => screen.findByText("Create TEST")).rejects.toThrow();
		await expect(screen.findByText("Create test")).resolves.toBeTruthy();
	});

	it("does not create a custom option if it already exists", async () => {
		render(() => (
			<Combobox options={["a"]} allowCustomValue>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={uniqueId(`combobox-item-${item}`)}>
							<Show when={isNewOptionValue(item)}>
								Create {item}
							</Show>

							<Show when={!isNewOptionValue(item)}>{item}</Show>
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
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

		fireEvent.input(comboboxInput, { target: { value: "TEST" } });
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();

		fireEvent.input(comboboxInput, { target: { value: "test" } });
		await expect(() => screen.findByText("Create TEST")).rejects.toThrow();
		await expect(screen.findByText("Create test")).resolves.toBeTruthy();

		fireEvent.input(comboboxInput, { target: { value: "a" } });
		await expect(screen.findByText("a")).resolves.toBeTruthy();
		await expect(() => screen.findByText("Create a")).rejects.toThrow();
		await expect(() => screen.findByText("Create TEST")).rejects.toThrow();
		await expect(() => screen.findByText("Create test")).rejects.toThrow();
	});

	it("ref can be focused", async () => {
		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={[]}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem item={item}>{item}</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		expect(ref).toBeTruthy();
		ref?.focus();

		const comboboxInput = await screen.findByTestId(
			uniqueId("combobox-input"),
		);
		expect(document.activeElement).toBe(comboboxInput);
	});

	it("ref can be blurred", async () => {
		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={[]}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={`combobox-item-${item}`}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		expect(ref).toBeTruthy();
		fireEvent.focus(ref as HTMLSelectElement);

		const comboboxInput = await screen.findByTestId(
			uniqueId("combobox-input"),
		);
		expect(document.activeElement).toBe(comboboxInput);

		fireEvent.blur(ref as HTMLSelectElement);
		expect(document.activeElement).not.toBe(comboboxInput);
	});

	it("ref can be clicked", async () => {
		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={[]}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent data-testid={uniqueId("combobox-content")}>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={`combobox-item-${item}`}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		expect(ref).toBeTruthy();
		fireEvent.click(ref as HTMLSelectElement);

		const comboboxInput = await screen.findByTestId(
			uniqueId("combobox-input"),
		);
		expect(document.activeElement).toBe(comboboxInput);

		const comboboxContent = await screen.findByTestId(
			uniqueId("combobox-content"),
		);
		expect(comboboxContent.getAttribute("data-state")).toBe("open");
	});

	it("resets input value to selected option when it loses focus", async () => {
		let ref: HTMLSelectElement | undefined;

		render(() => (
			<>
				<button />
				<Combobox
					ref={element => {
						ref = element;
					}}
					options={["a"]}
					allowCustomValue>
					<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
						<ComboboxInput
							data-testid={uniqueId("combobox-input")}
						/>
					</ComboboxTrigger>

					<ComboboxContent>
						{(item: string, isNewOptionValue) => (
							<ComboboxItem
								item={item}
								data-testid={uniqueId(`combobox-item-${item}`)}>
								<Show when={isNewOptionValue(item)}>
									Create {item}
								</Show>

								<Show when={!isNewOptionValue(item)}>
									{item}
								</Show>
							</ComboboxItem>
						)}
					</ComboboxContent>
				</Combobox>
			</>
		));

		const comboboxTrigger = await screen.findByTestId<HTMLButtonElement>(
			uniqueId("combobox-trigger"),
		);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		await userEvent.click(ref as HTMLSelectElement);
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
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();

		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");
		await userEvent.tab({ shift: true });
		await userEvent.click(comboboxTrigger);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");

		await waitFor(() => expect(comboboxInput.value).toBe("a"));
	});

	it("clears filters when it loses focus", async () => {
		let ref: HTMLSelectElement | undefined;

		render(() => (
			<>
				<button />
				<Combobox
					ref={element => {
						ref = element;
					}}
					options={["a"]}
					allowCustomValue>
					<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
						<ComboboxInput
							data-testid={uniqueId("combobox-input")}
						/>
					</ComboboxTrigger>

					<ComboboxContent>
						{(item: string, isNewOptionValue) => (
							<ComboboxItem
								item={item}
								data-testid={uniqueId(`combobox-item-${item}`)}>
								<Show when={isNewOptionValue(item)}>
									Create {item}
								</Show>

								<Show when={!isNewOptionValue(item)}>
									{item}
								</Show>
							</ComboboxItem>
						)}
					</ComboboxContent>
				</Combobox>
			</>
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
		await userEvent.type(comboboxInput, "a");

		const item = await screen.findByTestId<HTMLDivElement>(
			uniqueId("combobox-item-a"),
		);
		await userEvent.click(item);
		expect(comboboxInput.value).toBe("a");

		await userEvent.click(ref as HTMLSelectElement);
		await userEvent.clear(comboboxInput);
		await userEvent.type(comboboxInput, "TEST");
		expect(comboboxInput.value).toBe("TEST");
		await expect(() =>
			screen.findByTestId(uniqueId("combobox-item-a")),
		).rejects.toThrow();
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();

		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");
		await userEvent.tab({ shift: true });
		await userEvent.click(comboboxTrigger);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");

		await userEvent.click(comboboxTrigger);
		await expect(
			screen.findByTestId(uniqueId("combobox-item-a")),
		).resolves.toBeTruthy();
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();
	});

	it("can be controlled", async () => {
		render(() => (
			<Combobox options={["a", "b"]} value={"b"}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={uniqueId(`combobox-item-${item}`)}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
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

	it("throws an error if its content is not a render function", () => {
		// note: we usually use a `For` to render arrays
		// but there is no error when using a `For`
		// which means that the end result of using `For` is a function?
		expect(() =>
			render(() => (
				<Combobox options={["a", "b"]} value={"b"}>
					<ComboboxTrigger data-testid="combobox-trigger">
						<ComboboxInput data-testid="combobox-input" />
					</ComboboxTrigger>

					<ComboboxContent>
						{["a", "b"].map(item => {
							return (
								<ComboboxItem
									item={item}
									data-testid={`combobox-item-${item}`}>
									{item}
								</ComboboxItem>
							);
						})}
					</ComboboxContent>
				</Combobox>
			)),
		).toThrow();
	});

	it("can be cleared", async () => {
		render(() => (
			<Combobox options={["a", "b"]}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />

					<ComboboxClearSelection
						data-testid={uniqueId("combobox-clear-selection")}
					/>
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={uniqueId(`combobox-item-${item}`)}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
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

		const item = await screen.findByTestId<HTMLDivElement>(
			uniqueId("combobox-item-a"),
		);
		fireEvent.click(item);

		expect(comboboxInput.value).toBe("a");

		const comboboxClearSelection =
			await screen.findByTestId<HTMLButtonElement>(
				uniqueId("combobox-clear-selection"),
			);
		fireEvent.click(comboboxClearSelection);

		expect(comboboxInput.value).toBe("");
	});

	it("can select multiple options", async () => {
		const selections = [] as string[][];
		const onInput = vi.fn((event: InputEvent) => {
			const hiddenSelect = event.target as HTMLSelectElement;

			selections.push(
				[...hiddenSelect.selectedOptions].map(option => option.value),
			);
		});

		render(() => (
			<Combobox options={["a", "b", "c"]} multiple onInput={onInput}>
				<ComboboxTrigger data-testid={uniqueId("combobox-trigger")}>
					<ComboboxInput data-testid={uniqueId("combobox-input")} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={uniqueId(`combobox-item-${item}`)}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
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

		await userEvent.type(comboboxInput, "A");
		const firstItem = await screen.findByTestId<HTMLDivElement>(
			uniqueId("combobox-item-a"),
		);
		await userEvent.click(firstItem);

		await userEvent.clear(comboboxInput);
		await userEvent.type(comboboxInput, "c");
		const secondItem = await screen.findByTestId<HTMLDivElement>(
			uniqueId("combobox-item-c"),
		);
		await userEvent.click(secondItem);

		expect(onInput).toBeCalledTimes(2);
		expect(selections.at(0)).toEqual(["a"]);
		expect(selections.at(1)).toEqual(["a", "c"]);
		// https://github.com/chakra-ui/ark/issues/2535
		expect(comboboxInput.value).toBe("");
	});
});
