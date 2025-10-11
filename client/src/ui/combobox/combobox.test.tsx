/* eslint-disable-next-line */
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { uniqueId } from "es-toolkit/compat";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
	Combobox,
	ComboboxClearSelection,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
} from "./combobox";

describe("<Combobox />", () => {
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			disconnect() {}
			unobserve() {}
		},
	);

	it("emits an input event when new option is selected", async () => {
		render(() => (
			<Combobox options={["a", "b"]}>
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
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

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>("combobox-trigger");
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");
		await expect(
			screen.findByTestId<HTMLDivElement>("combobox-item-a"),
		).resolves.toBeTruthy();
		await expect(
			screen.findByTestId<HTMLDivElement>("combobox-item-b"),
		).resolves.toBeTruthy();

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>("combobox-input");
		fireEvent.input(comboboxInput, { target: { value: "A" } });
		await expect(() =>
			screen.findByTestId<HTMLDivElement>("combobox-item-b"),
		).rejects.toThrow();

		const item =
			await screen.findByTestId<HTMLDivElement>("combobox-item-a");
		fireEvent.click(item);

		expect(comboboxInput.value).toBe("a");

		cleanup();
	});

	it("emits an input event when custom option is selected", async () => {
		render(() => (
			<Combobox options={["a", "b"]} allowCustomValue>
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={`combobox-item-${item}`}>
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
			await screen.findByTestId<HTMLButtonElement>("combobox-trigger");
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>("combobox-input");
		fireEvent.input(comboboxInput, { target: { value: "TEST" } });
		await expect(() =>
			screen.findByTestId<HTMLDivElement>("combobox-item-b"),
		).rejects.toThrow();
		await expect(
			screen.findByTestId("combobox-item-TEST"),
		).resolves.toBeTruthy();

		const item =
			await screen.findByTestId<HTMLDivElement>("combobox-item-TEST");
		fireEvent.click(item);

		expect(comboboxInput.value).toBe("TEST");

		cleanup();
	});

	it("filters options based on input value", { timeout: 10000 }, async () => {
		render(() => (
			<Combobox options={["a", "b", "SOME oPtIoN"]}>
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
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

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>("combobox-trigger");
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>("combobox-input");

		fireEvent.input(comboboxInput, { target: { value: "A" } });
		await expect(
			screen.findByTestId("combobox-item-a"),
		).resolves.toBeTruthy();
		await expect(() =>
			screen.findByTestId<HTMLDivElement>("combobox-item-b"),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId("combobox-item-SOME oPtIoN"),
		).rejects.toThrow();

		fireEvent.input(comboboxInput, { target: { value: "b" } });
		await expect(
			screen.findByTestId<HTMLDivElement>("combobox-item-b"),
		).resolves.toBeTruthy();
		await expect(() =>
			screen.findByTestId("combobox-item-a"),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId("combobox-item-SOME oPtIoN"),
		).rejects.toThrow();

		fireEvent.input(comboboxInput, {
			target: { value: "SOME opTION" },
		});
		await expect(
			screen.findByTestId("combobox-item-SOME oPtIoN"),
		).resolves.toBeTruthy();
		await expect(() =>
			screen.findByTestId("combobox-item-a"),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId<HTMLDivElement>("combobox-item-b"),
		).rejects.toThrow();

		cleanup();
	});

	it("filters options when a custom filter is specified", async () => {
		render(() => (
			<Combobox
				options={["a", "b", "SOME oPtIoN"]}
				filter={(itemText, filterText) => itemText === filterText}>
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
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

		const comboboxTrigger =
			await screen.findByTestId<HTMLButtonElement>("combobox-trigger");
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>("combobox-input");

		fireEvent.input(comboboxInput, { target: { value: "A" } });
		await expect(() =>
			screen.findByTestId("combobox-item-a"),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId<HTMLDivElement>("combobox-item-b"),
		).rejects.toThrow();
		await expect(() =>
			screen.findByTestId("combobox-item-SOME oPtIoN"),
		).rejects.toThrow();

		cleanup();
	});

	it("creates only one custom option", async () => {
		render(() => (
			<Combobox options={["a"]} allowCustomValue>
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={`combobox-item-${item}`}>
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
			await screen.findByTestId<HTMLButtonElement>("combobox-trigger");
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>("combobox-input");

		fireEvent.input(comboboxInput, { target: { value: "TEST" } });
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();

		fireEvent.input(comboboxInput, { target: { value: "test" } });
		await expect(() => screen.findByText("Create TEST")).rejects.toThrow();
		await expect(screen.findByText("Create test")).resolves.toBeTruthy();

		cleanup();
	});

	it("does not create a custom option if it already exists", async () => {
		render(() => (
			<Combobox options={["a"]} allowCustomValue>
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={`combobox-item-${item}`}>
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
			await screen.findByTestId<HTMLButtonElement>("combobox-trigger");
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>("combobox-input");

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

		cleanup();
	});

	it("ref can be focused", async () => {
		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={[]}
				data-testid="combobox-root">
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
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
		ref?.focus();

		const comboboxInput = await screen.findByTestId("combobox-input");
		expect(document.activeElement).toBe(comboboxInput);

		cleanup();
	});

	it("ref can be blurred", async () => {
		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={[]}
				data-testid="combobox-root">
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
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

		const comboboxInput = await screen.findByTestId("combobox-input");
		expect(document.activeElement).toBe(comboboxInput);

		fireEvent.blur(ref as HTMLSelectElement);
		expect(document.activeElement).not.toBe(comboboxInput);

		cleanup();
	});

	it("ref can be clicked", async () => {
		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={[]}
				data-testid="combobox-root">
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
				</ComboboxTrigger>

				<ComboboxContent data-testid="combobox-content">
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

		const comboboxInput = await screen.findByTestId("combobox-input");
		expect(document.activeElement).toBe(comboboxInput);

		const comboboxContent = await screen.findByTestId("combobox-content");
		expect(comboboxContent.getAttribute("data-state")).toBe("open");

		cleanup();
	});

	// TODO: interact outside not triggered
	it.skip("resets input value to selected option when it loses focus", async () => {
		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={["a"]}
				allowCustomValue>
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={`combobox-item-${item}`}>
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
			await screen.findByTestId<HTMLButtonElement>("combobox-trigger");
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>("combobox-input");
		fireEvent.input(comboboxInput, { target: { value: "a" } });

		const item =
			await screen.findByTestId<HTMLDivElement>("combobox-item-a");
		fireEvent.click(item);
		expect(comboboxInput.value).toBe("a");

		fireEvent.input(comboboxInput, { target: { value: "TEST" } });
		expect(comboboxInput.value).toBe("TEST");
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();

		fireEvent.blur(ref as HTMLSelectElement);
		expect(comboboxInput.value).toBe("a");

		cleanup();
	});

	// TODO: interact outside not triggered
	it.skip("clears filters when it loses focus", async () => {
		let ref: HTMLSelectElement | undefined;

		render(() => (
			<Combobox
				ref={element => {
					ref = element;
				}}
				options={["a"]}
				allowCustomValue>
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem
							item={item}
							data-testid={`combobox-item-${item}`}>
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
			await screen.findByTestId<HTMLButtonElement>("combobox-trigger");
		expect(comboboxTrigger.getAttribute("data-state")).not.toBe("open");
		comboboxTrigger.click();
		expect(comboboxTrigger.getAttribute("data-state")).toBe("open");

		const comboboxInput =
			await screen.findByTestId<HTMLInputElement>("combobox-input");
		fireEvent.input(comboboxInput, { target: { value: "a" } });

		const item =
			await screen.findByTestId<HTMLDivElement>("combobox-item-a");
		fireEvent.click(item);
		expect(comboboxInput.value).toBe("a");

		fireEvent.click(ref as HTMLSelectElement);
		fireEvent.input(comboboxInput, { target: { value: "TEST" } });
		expect(comboboxInput.value).toBe("TEST");
		await expect(() =>
			screen.findByTestId("combobox-item-a"),
		).rejects.toThrow();
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();

		fireEvent.click(document.body);
		fireEvent.click(ref as HTMLSelectElement);

		await expect(
			screen.findByTestId("combobox-item-a"),
		).resolves.toBeTruthy();
		await expect(screen.findByText("Create TEST")).resolves.toBeTruthy();

		cleanup();
	});

	it("can be controlled", async () => {
		render(() => (
			<Combobox options={["a", "b"]} value={"b"}>
				<ComboboxTrigger data-testid="combobox-trigger">
					<ComboboxInput data-testid="combobox-input" />
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

		const unchecked =
			await screen.findByTestId<HTMLDivElement>("combobox-item-a");
		expect(unchecked.getAttribute("data-state")).not.toBe("checked");

		const checked =
			await screen.findByTestId<HTMLDivElement>("combobox-item-b");
		expect(checked.getAttribute("data-state")).toBe("checked");

		cleanup();
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

		cleanup();
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
});
