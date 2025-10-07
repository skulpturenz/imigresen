import { createFilter } from "@kobalte/core";
import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj as Story } from "storybook-solidjs";
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxTrigger,
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
		const [items, setItems] = createSignal<string[]>([]);

		const filter = createFilter({ sensitivity: "base" });
		const handleInputChange: JSX.ChangeEventHandler<
			HTMLSelectElement,
			Event
		> = event => {
			const options = [...event.target.options]
				.filter(option => option.selected)
				.map(option => option.value);

			setItems(
				initialItems.filter(item =>
					options.some(value => filter.contains(item, value)),
				),
			);
		};

		return (
			<Combobox
				options={initialItems}
				placeholder="Search framework..."
				value={items()}
				onChange={handleInputChange}
				itemComponent={props => (
					<ComboboxItem item={props.item}>
						{props.item.rawValue}
					</ComboboxItem>
				)}>
				<ComboboxTrigger>
					<ComboboxInput />
				</ComboboxTrigger>

				<ComboboxContent />
			</Combobox>
		);
	},
};
