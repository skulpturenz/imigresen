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
import { uniqueId } from "es-toolkit/compat";
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

	beforeAll(() => {
		userEvent.setup();
	});

	afterEach(() => {
		cleanup();
	});

	it("emits an input event when new option is selected", async () => {
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
			b: uniqueId("combobox-item-b"),
		};

		const onInput = vi.fn();
		render(() => (
			<Combobox options={["a", "b"]} onInput={onInput}>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={
								OPTION_TEST_IDS[
									item as keyof typeof OPTION_TEST_IDS
								]
							}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>(TRIGGER_TEST_ID);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");
		await expect(
			screen.findByTestId<HTMLDivElement>(OPTION_TEST_IDS.a),
		).resolves.toBeTruthy();
		await expect(
			screen.findByTestId<HTMLDivElement>(OPTION_TEST_IDS.b),
		).resolves.toBeTruthy();

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>(INPUT_TEST_ID);
		fireEvent.input(comboboxInput, { target: { value: "A" } });
		await expect(() =>
			screen.findByTestId<HTMLDivElement>(OPTION_TEST_IDS.b),
		).rejects.toThrow();

		const item = await screen.findByTestId<HTMLDivElement>(
			OPTION_TEST_IDS.a,
		);
		fireEvent.click(item);

		expect(comboboxInput.value).toBe("a");
		expect(onInput).toBeCalledTimes(1);
	});

	it("emits an input event when custom option is selected", async () => {
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
			b: uniqueId("combobox-item-b"),
			TEST: uniqueId("combobox-item-test"),
		};

		const onInput = vi.fn();
		render(() => (
			<Combobox options={["a", "b"]} allowCustomValue onInput={onInput}>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={
								OPTION_TEST_IDS[
									item as keyof typeof OPTION_TEST_IDS
								]
							}>
							<Show when={isNewOptionValue(item)}>
								Create {item}
							</Show>

							<Show when={!isNewOptionValue(item)}>{item}</Show>
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>(TRIGGER_TEST_ID);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>(INPUT_TEST_ID);
		fireEvent.input(comboboxInput, { target: { value: "TEST" } });
		await expect(() =>
			screen.findByTestId<HTMLDivElement>(OPTION_TEST_IDS.b),
		).rejects.toThrow();
		await expect(
			screen.findByTestId(OPTION_TEST_IDS.TEST),
		).resolves.toBeTruthy();

		const item = await screen.findByTestId<HTMLDivElement>(
			OPTION_TEST_IDS.TEST,
		);
		fireEvent.click(item);

		expect(comboboxInput.value).toBe("TEST");
		expect(onInput).toBeCalledTimes(1);
	});

	it("filters options based on input value", { timeout: 10000 }, async () => {
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
			b: uniqueId("combobox-item-b"),
			"SOME oPtIoN": uniqueId("combobox-item-some-option"),
		};

		render(() => (
			<Combobox options={["a", "b", "SOME oPtIoN"]}>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={
								OPTION_TEST_IDS[
									item as keyof typeof OPTION_TEST_IDS
								]
							}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>(TRIGGER_TEST_ID);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>(INPUT_TEST_ID);

		fireEvent.input(comboboxInput, { target: { value: "A" } });
		await expect(
			screen.findByTestId(OPTION_TEST_IDS.a),
		).resolves.toBeTruthy();
		await expect(() =>
			screen.findByTestId<HTMLDivElement>(OPTION_TEST_IDS.b),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId(OPTION_TEST_IDS["SOME oPtIoN"]),
		).rejects.toThrow();

		fireEvent.input(comboboxInput, { target: { value: "b" } });
		await expect(
			screen.findByTestId<HTMLDivElement>(OPTION_TEST_IDS.b),
		).resolves.toBeTruthy();
		await expect(() =>
			screen.findByTestId(OPTION_TEST_IDS.a),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId(OPTION_TEST_IDS["SOME oPtIoN"]),
		).rejects.toThrow();

		fireEvent.input(comboboxInput, {
			target: { value: "SOME opTION" },
		});
		await expect(
			screen.findByTestId(OPTION_TEST_IDS["SOME oPtIoN"]),
		).resolves.toBeTruthy();
		await expect(() =>
			screen.findByTestId(OPTION_TEST_IDS.a),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId<HTMLDivElement>(OPTION_TEST_IDS.b),
		).rejects.toThrow();
	});

	it("filters options when a custom filter is specified", async () => {
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
			b: uniqueId("combobox-item-b"),
			"SOME oPtIoN": uniqueId("combobox-item-some-option"),
		};

		render(() => (
			<Combobox
				options={["a", "b", "SOME oPtIoN"]}
				filter={(itemText, filterText) => itemText === filterText}>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={
								OPTION_TEST_IDS[
									item as keyof typeof OPTION_TEST_IDS
								]
							}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>(TRIGGER_TEST_ID);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>(INPUT_TEST_ID);

		fireEvent.input(comboboxInput, { target: { value: "A" } });
		await expect(() =>
			screen.findByTestId(OPTION_TEST_IDS.a),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId<HTMLDivElement>(OPTION_TEST_IDS.b),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId(OPTION_TEST_IDS["SOME oPtIoN"]),
		).rejects.toThrow();
	});

	it("creates only one custom option", async () => {
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
		};

		render(() => (
			<Combobox options={["a"]} allowCustomValue>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={
								OPTION_TEST_IDS[
									item as keyof typeof OPTION_TEST_IDS
								]
							}>
							<Show when={isNewOptionValue(item)}>
								Create {item}
							</Show>

							<Show when={!isNewOptionValue(item)}>{item}</Show>
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>(TRIGGER_TEST_ID);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>(INPUT_TEST_ID);

		fireEvent.input(comboboxInput, { target: { value: "TEST" } });
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();

		fireEvent.input(comboboxInput, { target: { value: "test" } });
		await expect(() => screen.findByText("Create TEST")).rejects.toThrow();
		await expect(screen.findByText("Create test")).resolves.toBeTruthy();
	});

	it("does not create a custom option if it already exists", async () => {
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
		};

		render(() => (
			<Combobox options={["a"]} allowCustomValue>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={
								OPTION_TEST_IDS[
									item as keyof typeof OPTION_TEST_IDS
								]
							}>
							<Show when={isNewOptionValue(item)}>
								Create {item}
							</Show>

							<Show when={!isNewOptionValue(item)}>{item}</Show>
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>(TRIGGER_TEST_ID);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>(INPUT_TEST_ID);

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
		const ROOT_TEST_ID = uniqueId("combobox-root");
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");

		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={[]}
				data-testid={ROOT_TEST_ID}>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
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

		const comboboxInput = await screen.findByTestId(INPUT_TEST_ID);
		expect(document.activeElement).toBe(comboboxInput);
	});

	it("ref can be blurred", async () => {
		const ROOT_TEST_ID = uniqueId("combobox-root");
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");

		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={[]}
				data-testid={ROOT_TEST_ID}>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
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

		const comboboxInput = await screen.findByTestId(INPUT_TEST_ID);
		expect(document.activeElement).toBe(comboboxInput);

		fireEvent.blur(ref as HTMLSelectElement);
		expect(document.activeElement).not.toBe(comboboxInput);
	});

	it("ref can be clicked", async () => {
		const ROOT_TEST_ID = uniqueId("combobox-root");
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const CONTENT_TEST_ID = uniqueId("combobox-content");

		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={[]}
				data-testid={ROOT_TEST_ID}>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
				</ComboboxTrigger>

				<ComboboxContent data-testid={CONTENT_TEST_ID}>
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

		const comboboxInput = await screen.findByTestId(INPUT_TEST_ID);
		expect(document.activeElement).toBe(comboboxInput);

		const comboboxContent = await screen.findByTestId(CONTENT_TEST_ID);
		expect(comboboxContent.getAttribute("data-state")).toBe("open");
	});

	it("resets input value to selected option when it loses focus", async () => {
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
		};

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
					<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
						<ComboboxInput data-testid={INPUT_TEST_ID} />
					</ComboboxTrigger>

					<ComboboxContent>
						{(item: string, isNewOptionValue) => (
							<ComboboxItem
								item={item}
								data-testid={
									OPTION_TEST_IDS[
										item as keyof typeof OPTION_TEST_IDS
									]
								}>
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

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>(TRIGGER_TEST_ID);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		await userEvent.click(ref as HTMLSelectElement);
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>(INPUT_TEST_ID);
		await userEvent.type(comboboxInput, "a");

		const item = await screen.findByTestId<HTMLDivElement>(
			OPTION_TEST_IDS.a,
		);
		await userEvent.click(item);
		expect(comboboxInput.value).toBe("a");

		await userEvent.clear(comboboxInput);
		await userEvent.type(comboboxInput, "TEST");
		await expect(() =>
			screen.findByTestId(OPTION_TEST_IDS.a),
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
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
		};
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
					<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
						<ComboboxInput data-testid={INPUT_TEST_ID} />
					</ComboboxTrigger>

					<ComboboxContent>
						{(item: string, isNewOptionValue) => (
							<ComboboxItem
								item={item}
								data-testid={
									OPTION_TEST_IDS[
										item as keyof typeof OPTION_TEST_IDS
									]
								}>
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

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>(TRIGGER_TEST_ID);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		await userEvent.click(comboboxTrigger);
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>(INPUT_TEST_ID);
		await userEvent.type(comboboxInput, "a");

		const item = await screen.findByTestId<HTMLDivElement>(
			OPTION_TEST_IDS.a,
		);
		await userEvent.click(item);
		expect(comboboxInput.value).toBe("a");

		await userEvent.click(ref as HTMLSelectElement);
		await userEvent.clear(comboboxInput);
		await userEvent.type(comboboxInput, "TEST");
		expect(comboboxInput.value).toBe("TEST");
		await expect(() =>
			screen.findByTestId(OPTION_TEST_IDS.a),
		).rejects.toThrow();
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();

		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");
		await userEvent.tab({ shift: true });
		await userEvent.click(comboboxTrigger);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");

		await userEvent.click(comboboxTrigger);
		await expect(
			screen.findByTestId(OPTION_TEST_IDS.a),
		).resolves.toBeTruthy();
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();
	});

	it("can be controlled", async () => {
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
			b: uniqueId("combobox-item-b"),
		};

		render(() => (
			<Combobox options={["a", "b"]} value={"b"}>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={
								OPTION_TEST_IDS[
									item as keyof typeof OPTION_TEST_IDS
								]
							}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		const unchecked = await screen.findByTestId<HTMLDivElement>(
			OPTION_TEST_IDS.a,
		);
		expect(unchecked.getAttribute("data-state")).not.toBe("checked");

		const checked = await screen.findByTestId<HTMLDivElement>(
			OPTION_TEST_IDS.b,
		);
		expect(checked.getAttribute("data-state")).toBe("checked");
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
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const CLEAR_SELECTION_TEST_ID = uniqueId("combobox-clear-selection");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
			b: uniqueId("combobox-item-b"),
		};

		render(() => (
			<Combobox options={["a", "b"]}>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />

					<ComboboxClearSelection
						data-testid={CLEAR_SELECTION_TEST_ID}
					/>
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={
								OPTION_TEST_IDS[
									item as keyof typeof OPTION_TEST_IDS
								]
							}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>(TRIGGER_TEST_ID);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>(INPUT_TEST_ID);
		fireEvent.input(comboboxInput, { target: { value: "A" } });

		const item = await screen.findByTestId<HTMLDivElement>(
			OPTION_TEST_IDS.a,
		);
		fireEvent.click(item);

		expect(comboboxInput.value).toBe("a");

		const comboboxClearSelection =
			await screen.findByTestId<HTMLButtonElement>(
				CLEAR_SELECTION_TEST_ID,
			);
		fireEvent.click(comboboxClearSelection);

		expect(comboboxInput.value).toBe("");
	});

	it("can select multiple options", async () => {
		const TRIGGER_TEST_ID = uniqueId("combobox-trigger");
		const INPUT_TEST_ID = uniqueId("combobox-input");
		const OPTION_TEST_IDS = {
			a: uniqueId("combobox-item-a"),
			b: uniqueId("combobox-item-b"),
			c: uniqueId("combobox-item-c"),
		};

		const selections = [] as string[][];
		const onInput = vi.fn((event: InputEvent) => {
			const hiddenSelect = event.target as HTMLSelectElement;

			selections.push(
				[...hiddenSelect.selectedOptions].map(option => option.value),
			);
		});

		render(() => (
			<Combobox options={["a", "b", "c"]} multiple onInput={onInput}>
				<ComboboxTrigger data-testid={TRIGGER_TEST_ID}>
					<ComboboxInput data-testid={INPUT_TEST_ID} />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem
							item={item}
							data-testid={
								OPTION_TEST_IDS[
									item as keyof typeof OPTION_TEST_IDS
								]
							}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		));

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>(TRIGGER_TEST_ID);
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>(INPUT_TEST_ID);

		await userEvent.type(comboboxInput, "A");
		const firstItem = await screen.findByTestId<HTMLDivElement>(
			OPTION_TEST_IDS.a,
		);
		await userEvent.click(firstItem);

		await userEvent.clear(comboboxInput);
		await userEvent.type(comboboxInput, "c");
		const secondItem = await screen.findByTestId<HTMLDivElement>(
			OPTION_TEST_IDS.c,
		);
		await userEvent.click(secondItem);

		expect(onInput).toBeCalledTimes(2);
		expect(selections.at(0)).toEqual(["a"]);
		expect(selections.at(1)).toEqual(["a", "c"]);
		expect(comboboxInput.value).toBe("");
	});
});
