import { createMemo, createSignal, For } from "solid-js";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
	createListCollection,
	type ComboboxInputValueChangeDetails,
} from "ui/combobox";

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
		const [items, setItems] = createSignal(initialItems);
		const collection = createMemo(() =>
			createListCollection({ items: items() }),
		);

		const handleInputChange = (
			details: ComboboxInputValueChangeDetails,
		) => {
			setItems(
				initialItems.filter(item =>
					item
						.toLowerCase()
						.includes(details.inputValue.toLowerCase()),
				),
			);
		};

		return (
			<Combobox
				collection={collection()}
				placeholder="Search framework..."
				onInputValueChange={handleInputChange}>
				<ComboboxTrigger>
					<ComboboxInput />
				</ComboboxTrigger>

				<ComboboxContent>
					<For each={collection().items}>
						{item => (
							<ComboboxItem item={item}>{item}</ComboboxItem>
						)}
					</For>
				</ComboboxContent>
			</Combobox>
		);
	},
};
