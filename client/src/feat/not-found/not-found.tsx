import { A, useParams } from "@solidjs/router";
import { Button } from "ui/button";
import { Typography } from "ui/typography";
import { resources } from "./resources";

export const NotFound = () => {
	const params = useParams<{ path?: string }>();

	return (
		<main class="py-24 sm:py-32">
			<Typography variant="small">{resources.notFound}</Typography>

			<Typography
				variant="h1"
				as="h1"
				class="mt-4 text-balance text-foreground underline decoration-destructive underline-offset-4">
				{resources.header}
			</Typography>

			<Typography
				variant="large"
				class="mt-6 text-pretty text-foreground">
				{resources.subtitle(params.path)}
			</Typography>

			<Button class="mt-10">
				<A href="/">{resources.doBackToHome}</A>
			</Button>
		</main>
	);
};
