import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Typography } from "ui/typography";

export default {
	title: "ui/typography",
	component: Typography,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Typography>;

export const Blockquote: Story<typeof Typography> = {
	args: {
		variant: "blockquote",
		as: "blockquote",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const Paragraph: Story<typeof Typography> = {
	args: {
		variant: "p",
		as: "p",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const HeadingOne: Story<typeof Typography> = {
	args: {
		variant: "h1",
		as: "h1",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const HeadingTwo: Story<typeof Typography> = {
	args: {
		variant: "h2",
		as: "h2",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const HeadingThree: Story<typeof Typography> = {
	args: {
		variant: "h3",
		as: "h3",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const HeadingFour: Story<typeof Typography> = {
	args: {
		variant: "h4",
		as: "h4",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const Large: Story<typeof Typography> = {
	args: {
		variant: "large",
		as: "div",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const Small: Story<typeof Typography> = {
	args: {
		variant: "small",
		as: "small",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const Lead: Story<typeof Typography> = {
	args: {
		variant: "lead",
		as: "p",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const Muted: Story<typeof Typography> = {
	args: {
		variant: "muted",
		as: "p",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const OrderedList: Story<typeof Typography> = {
	args: {
		variant: "ol",
		as: "ol",
		children: (
			<>
				<li>
					No one shall be held in slavery or servitude; slavery and
					the slave trade shall be prohibited in all their forms.
				</li>
				<li>
					Whereas a common understanding of these rights and freedoms
					is
				</li>
				<li>
					Everyone has the right to an effective remedy by the
					competent national tribunals for acts violating the
					fundamental rights granted him by the constitution or by
					law.
				</li>
				<li>
					No one shall be subjected to arbitrary arrest, detention or
					exile. Everyone is entitled in full equality to a fair and
					public hearing by an independent and impartial tribunal, in
					the determination of his rights and obligations and of any
					criminal charge against him. No one shall be subjected to
					arbitrary interference with his privacy, family, home or
					correspondence, nor to attacks upon his honour and
					reputation. Everyone has the right to the protection of the
					law against such interference or attacks.
				</li>
				<li>
					Everyone has the right to freedom of thought, conscience and
					religion; this right includes freedom to change his religion
					or belief, and freedom, either alone or in community with
					others and in public or private, to manifest his religion or
					belief in teaching, practice, worship and observance.
					Everyone has the right to freedom of opinion and expression;
					this right includes freedom to hold opinions without
					interference and to seek, receive and impart information and
					ideas through any media and regardless of frontiers.
					Everyone has the right to rest and leisure, including
					reasonable limitation of working hours and periodic holidays
					with pay.
				</li>
			</>
		),
	},
};

export const UnorderedList: Story<typeof Typography> = {
	args: {
		variant: "ul",
		as: "ul",
		children: (
			<>
				<li>
					No one shall be held in slavery or servitude; slavery and
					the slave trade shall be prohibited in all their forms.
				</li>
				<li>
					Whereas a common understanding of these rights and freedoms
					is
				</li>
				<li>
					Everyone has the right to an effective remedy by the
					competent national tribunals for acts violating the
					fundamental rights granted him by the constitution or by
					law.
				</li>
				<li>
					No one shall be subjected to arbitrary arrest, detention or
					exile. Everyone is entitled in full equality to a fair and
					public hearing by an independent and impartial tribunal, in
					the determination of his rights and obligations and of any
					criminal charge against him. No one shall be subjected to
					arbitrary interference with his privacy, family, home or
					correspondence, nor to attacks upon his honour and
					reputation. Everyone has the right to the protection of the
					law against such interference or attacks.
				</li>
				<li>
					Everyone has the right to freedom of thought, conscience and
					religion; this right includes freedom to change his religion
					or belief, and freedom, either alone or in community with
					others and in public or private, to manifest his religion or
					belief in teaching, practice, worship and observance.
					Everyone has the right to freedom of opinion and expression;
					this right includes freedom to hold opinions without
					interference and to seek, receive and impart information and
					ideas through any media and regardless of frontiers.
					Everyone has the right to rest and leisure, including
					reasonable limitation of working hours and periodic holidays
					with pay.
				</li>
			</>
		),
	},
};
