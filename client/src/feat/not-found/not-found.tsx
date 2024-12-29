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
				{!params.path && resources.subtitle(params.path).at(0)}

				{params.path && (
					<>
						{resources.subtitle(params.path).at(0)}&nbsp;
						<Typography as="code" variant="code">
							{resources.subtitle(params.path).at(1)}
						</Typography>
						{resources.subtitle(params.path).at(2)}
					</>
				)}
			</Typography>

			<Button as={A} href="/" class="mt-10">
				<>
					{resources.doBackToHome.at(0)}&nbsp;
					<Typography as="code" variant="code">
						{resources.doBackToHome.at(1)}
					</Typography>
				</>
			</Button>
		</main>
	);
};
