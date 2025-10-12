import { useFilter } from "@ark-ui/solid/locale";
import { createSignal, For, Show } from "solid-js";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Badge } from "ui/badge";
import {
	Combobox,
	ComboboxClearSelection,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
	Searchbox,
	type ComboboxInputValueChangeDetails,
} from "ui/combobox";
import { cn } from "ui/utils";

export default {
	title: "ui/combobox",
	component: Combobox,
	parameters: {
		docs: {
			description: {
				component:
					"Combines a text input with a listbox, allowing users to filter a list of options to items matching a query",
			},
		},
	},
} satisfies Meta<typeof Combobox>;

export const Default: Story<typeof Combobox> = {
	render: () => {
		const initialItems = [
			"Next.js",
			"Astro",
			"Qwik",
			"SolidStart",
			"Nuxt.js",
		];

		return (
			<Combobox
				options={initialItems}
				placeholder="Search framework..."
				allowCustomValue>
				<ComboboxTrigger>
					<ComboboxInput>
						<ComboboxClearSelection />
					</ComboboxInput>
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem item={item}>
							<Show when={isNewOptionValue(item)}>
								+ Create {item}
							</Show>

							<Show when={!isNewOptionValue(item)}>{item}</Show>
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		);
	},
};

export const MultipleOptions: Story<typeof Combobox> = {
	render: () => {
		const initialItems = [
			"Next.js",
			"Astro",
			"Qwik",
			"SolidStart",
			"Nuxt.js",
		];

		const [selectedOptions, setSelectedOptions] = createSignal<string[]>(
			[],
		);
		const onInput = (event: InputEvent) => {
			const selectedOptions = [
				...(event.target as HTMLSelectElement).selectedOptions,
			].map(option => option.value);

			setSelectedOptions(selectedOptions);
		};

		return (
			<Combobox
				options={initialItems}
				multiple
				placeholder="Search framework..."
				onInput={onInput}
				allowCustomValue>
				<ComboboxTrigger
					class={cn(
						"w-52",
						selectedOptions().length > 0
							? "flex flex-col gap-2"
							: "",
						selectedOptions().length > 0 ? "h-full" : "h-10",
						selectedOptions().length > 0 ? "p-2" : "",
					)}>
					<Show when={selectedOptions().length}>
						<div class="flex flex-wrap gap-2 max-w-sm">
							<For each={selectedOptions()}>
								{item => <Badge>{item}</Badge>}
							</For>
						</div>
					</Show>

					<ComboboxInput>
						<ComboboxClearSelection />
					</ComboboxInput>
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string, isNewOptionValue) => (
						<ComboboxItem item={item}>
							<Show when={isNewOptionValue(item)}>
								+ Create {item}
							</Show>

							<Show when={!isNewOptionValue(item)}>{item}</Show>
						</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		);
	},
};

export const Search: Story<typeof Searchbox> = {
	render: () => {
		const initialItems = [
			"Next.js",
			"Astro",
			"Qwik",
			"SolidStart",
			"Nuxt.js",
		];
		const filterFn = useFilter({ sensitivity: "base" });

		const [options, setOptions] = createSignal(initialItems);
		const onInputValueChange = (
			details: ComboboxInputValueChangeDetails,
		) => {
			// in reality we would want to fetch a new list of options instead of filtering it

			setOptions(
				initialItems.filter(item =>
					filterFn().contains(item, details.inputValue),
				),
			);
		};

		return (
			<Searchbox
				options={options()}
				placeholder="Search framework..."
				onInputValueChange={onInputValueChange}>
				<ComboboxTrigger>
					<ComboboxInput>
						<ComboboxClearSelection />
					</ComboboxInput>
				</ComboboxTrigger>

				<ComboboxContent>
					<For each={options()}>
						{(item: string) => (
							<ComboboxItem item={item}>{item}</ComboboxItem>
						)}
					</For>
				</ComboboxContent>
			</Searchbox>
		);
	},
};
