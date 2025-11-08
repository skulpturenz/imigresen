import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { DatePicker } from "ui/date-picker";
import { DateRangePicker } from "./date-range-picker";
import { SingleDatePicker } from "./single-date-picker";

export default {
	title: "ui/date-picker",
	component: DatePicker,
	parameters: {
		docs: {
			description: {
				component: "A date picker component with range and presets",
			},
		},
	},
} satisfies Meta<typeof DatePicker>;

export const Default: Story<typeof DatePicker> = {
	render: () => <SingleDatePicker onInput={console.debug} />,
};

export const DateRange: Story<typeof DateRangePicker> = {
	render: () => <DateRangePicker onInput={console.debug} />,
};
