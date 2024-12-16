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
	render: () => (
		<Combobox
			options={["Next.js", "Astro", "Qwik", "SolidStart", "Nuxt.js"]}
			placeholder="Search framework..."
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
	),
};
