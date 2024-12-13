import type { Meta, StoryObj as Story } from "storybook-solidjs";
import { Typography } from "ui/typography";

export default {
	title: "ui/typography",
	component: Typography,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta;

// TODO: setting `component` seems to throw

export const Blockquote: Story<typeof Typography> = {
	args: {
		variant: "blockquote",
		// component: "blockquote",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const P: Story<typeof Typography> = {
	args: {
		variant: "p",
		// component: "p",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const H1: Story<typeof Typography> = {
	args: {
		variant: "h1",
		// component: "h1",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const H2: Story<typeof Typography> = {
	args: {
		variant: "h2",
		// component: "h2",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const H3: Story<typeof Typography> = {
	args: {
		variant: "h3",
		// component: "h3",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const H4: Story<typeof Typography> = {
	args: {
		variant: "h4",
		// component: "h4",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const Large: Story<typeof Typography> = {
	args: {
		variant: "large",
		// component: "div",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const Small: Story<typeof Typography> = {
	args: {
		variant: "small",
		// component: "small",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const Lead: Story<typeof Typography> = {
	args: {
		variant: "lead",
		// component: "p",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const Muted: Story<typeof Typography> = {
	args: {
		variant: "muted",
		// component: "p",
		children:
			"No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.",
	},
};

export const Ol: Story<typeof Typography> = {
	args: {
		variant: "ol",
		// component: "ol",
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

export const Ul: Story<typeof Typography> = {
	args: {
		variant: "ul",
		// component: "ul",
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
