import { A, useParams } from "@solidjs/router";
import { useI18n } from "core/context/i18n";
import { Button } from "ui/button";
import { Typography } from "ui/typography";
import type { resources } from "./resources/i18n/en-us";

export const NotFound = () => {
	const params = useParams<{ path?: string }>();
	const t = useI18n<typeof resources>();

	return (
		<main class="py-24 sm:py-32">
			<Typography variant="small">{t("notFound")}</Typography>

			<Typography
				variant="h1"
				as="h1"
				class="mt-4 text-balance text-foreground underline decoration-destructive underline-offset-4">
				{t("header")}
			</Typography>

			<Typography
				variant="large"
				class="mt-6 text-pretty text-foreground">
				{!params.path && t("subtitle", params.path).at(0)}

				{params.path && (
					<>
						{t("subtitle", params.path).at(0)}&nbsp;
						<Typography as="code" variant="code">
							{t("subtitle", params.path).at(1)}
						</Typography>
						{t("subtitle", params.path).at(2)}
					</>
				)}
			</Typography>

			<Button as={A} href="/" class="mt-10">
				<>
					{t("doBackToHome").at(0)}&nbsp;
					<Typography as="code" variant="code">
						{t("doBackToHome").at(1)}
					</Typography>
				</>
			</Button>
		</main>
	);
};
