import { A, Navigate, useLocation } from "@solidjs/router";
import { CoreRoute } from "core/constants/core-route.enum";
import { useI18n } from "core/context/i18n";
import { toPath } from "core/router/utils";
import { Show } from "solid-js";
import { Button } from "ui/button";
import { Typography } from "ui/typography";
import type { resources } from "./resources/i18n/en-US";

interface UnathorizedLocationState {
	referer: string;
}

export const Unauthorized = () => {
	const location = useLocation<UnathorizedLocationState>();
	const t = useI18n<typeof resources>();

	return (
		<>
			<Show when={!location.state?.referer}>
				<Navigate href={toPath(CoreRoute.Home)} />
			</Show>

			<Show when={location.state?.referer}>
				<main class="py-24 sm:py-32">
					<Typography variant="small">{t("forbidden")}</Typography>

					<Typography
						variant="h1"
						as="h1"
						class="mt-4 text-balance text-foreground underline decoration-destructive underline-offset-4">
						{t("header")}
					</Typography>

					<Typography
						variant="large"
						class="mt-6 text-pretty text-foreground">
						{t("subtitle")}
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
			</Show>
		</>
	);
};
