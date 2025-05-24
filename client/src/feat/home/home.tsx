import { A } from "@solidjs/router";
import { MyPassportForm } from "core/constants/my-passport-form-route.enum";
import { useI18n } from "core/context/i18n";
import { toPath } from "core/router/route";
import { For, Show } from "solid-js";
import { Button } from "ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui/tooltip";
import { Typography } from "ui/typography";
import { usePassportApplications } from "./hooks/usePassportApplications";
import type { resources } from "./resources/i18n/en-US";

export const Home = () => {
	const { passportApplications } = usePassportApplications();
	const t = useI18n<typeof resources>();

	return (
		<div>
			<div class="flex justify-end my-8">
				<Button as="a" href={toPath(MyPassportForm.New)}>
					{t("doApply")}
				</Button>
			</div>

			<Show when={!passportApplications.isLoading}>
				<Show when={!passportApplications.data?.length}>
					<Typography variant="h3" class="text-center">
						No applications yet!
					</Typography>
				</Show>

				<Show when={passportApplications.data?.length}>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
						<For each={passportApplications.data}>
							{item => {
								const getHref = () => {
									const url = new URL(location.origin);
									url.hash = location.hash;

									const searchParams = new URLSearchParams({
										automergeUrl: item.automergeUrl,
									});

									url.pathname = MyPassportForm.Edit.replace(
										":uuid",
										item.uuid,
									);
									url.search = searchParams.toString();

									return url.href;
								};

								const details = [
									{
										label: "Email",
										description: "test@test.com",
									},
									{
										label: "Mobile number",
										description: "0234567890",
									},
									{
										label: "Document type",
										description:
											"Malaysian passport (64 pages)",
									},
									{
										label: "Current document number",
										description: "A1234124",
									},
									{
										label: "Status",
										description: "In progress",
									},
								];

								return (
									<A href={getHref()} class="group max-w-md">
										<Card class="h-full">
											<CardHeader>
												<Tooltip>
													<TooltipTrigger
														as={CardTitle}
														class="truncate">
														{
															item.personalDetails
																.firstName
														}
														&nbsp;
														{
															item.personalDetails
																.lastName
														}
													</TooltipTrigger>
													<TooltipContent>
														{
															item.personalDetails
																.firstName
														}
														&nbsp;
														{
															item.personalDetails
																.lastName
														}
													</TooltipContent>
												</Tooltip>
												<CardDescription>
													Malaysian passport
												</CardDescription>
											</CardHeader>
											<CardContent>
												<For each={details}>
													{item => (
														<div class="mb-4 grid grid-cols-[20px_1fr] items-start pb-4 last:mb-0 last:pb-0">
															<span class="flex size-2 translate-y-1 bg-teal-500 dark:bg-teal-400" />

															<div class="space-y-2">
																<Typography
																	variant="small"
																	as="p">
																	{item.label}
																</Typography>

																<Typography
																	variant="small"
																	as="p">
																	{
																		item.description
																	}
																</Typography>
															</div>
														</div>
													)}
												</For>
											</CardContent>

											<CardFooter>
												<Button class="w-full group-hover:bg-primary/80">
													Edit
												</Button>
											</CardFooter>
										</Card>
									</A>
								);
							}}
						</For>
					</div>
				</Show>
			</Show>
		</div>
	);
};
