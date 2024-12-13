import type { Meta, StoryObj as Story } from "storybook-solidjs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "ui/select";

export default {
	title: "ui/select",
	component: Select,
	parameters: {
		docs: {
			description: {
				component:
					"Displays a list of options for the user to pick from — triggered by a button",
			},
		},
	},
} satisfies Meta<typeof Select>;

export const Default: Story<typeof Select> = {
	render: () => (
		<Select
			options={["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]}
			placeholder="Select a fruit…"
			itemComponent={props => (
				<SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
			)}>
			<SelectTrigger class="w-48">
				<SelectValue<string>>
					{state => state.selectedOption()}
				</SelectValue>
			</SelectTrigger>
			<SelectContent />
		</Select>
	),
};
