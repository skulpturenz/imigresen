import { A } from "@solidjs/router";
import { Button } from "ui/button";
import { Typography } from "ui/typography";

const resources = {
	notFound: "404",
	header: "Page not found",
	subtitle: "Sorry, we couldn't find the page you're looking for.",
	doBackToHome: "Go back home",
};

export const NotFound = () => (
	<main class="py-24 sm:py-32">
		<Typography variant="small" class="text-foreground">
			{resources.notFound}
		</Typography>

		<Typography
			variant="h1"
			as="h1"
			class="mt-4 text-balance text-foreground">
			{resources.header}
		</Typography>

		<Typography variant="large" class="mt-6 text-pretty text-foreground">
			{resources.subtitle}
		</Typography>

		<Button class="mt-10">
			<A href="/">{resources.doBackToHome}</A>
		</Button>
	</main>
);
