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

		return (
			<Combobox options={initialItems} placeholder="Search framework...">
				<ComboboxTrigger>
					<ComboboxInput />
				</ComboboxTrigger>

				<ComboboxContent>
					{(item: string) => (
						<ComboboxItem item={item}>{item}</ComboboxItem>
					)}
				</ComboboxContent>
			</Combobox>
		);
	},
};
