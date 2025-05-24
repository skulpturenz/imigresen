import { A } from "@solidjs/router";
import { MyPassportForm } from "core/constants/my-passport-form-route.enum";
import { useI18n } from "core/context/i18n";
import { toPath } from "core/router/route";
import {
	differenceInDays,
	differenceInMonths,
	differenceInWeeks,
	differenceInYears,
} from "date-fns";
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

	const getDifference = (expiryDate: Date) => {
		const yearsToExpiry = differenceInYears(expiryDate, Date.now());
		if (yearsToExpiry > 0) {
			return yearsToExpiry;
		}

		const monthsToExpiry = differenceInMonths(expiryDate, new Date());
		if (monthsToExpiry > 0) {
			return monthsToExpiry;
		}

		const weeksToExpiry = differenceInWeeks(expiryDate, new Date());
		if (weeksToExpiry > 0) {
			return weeksToExpiry;
		}

		const daysToExpiry = differenceInDays(expiryDate, new Date());
		return daysToExpiry;
	};

	const getDifferenceUnit = (expiryDate: Date) => {
		const yearsToExpiry = differenceInYears(expiryDate, Date.now());
		if (yearsToExpiry > 0) {
			return "years";
		}

		const monthsToExpiry = differenceInMonths(expiryDate, new Date());
		if (monthsToExpiry > 0) {
			return "months";
		}

		const weeksToExpiry = differenceInWeeks(expiryDate, new Date());
		if (weeksToExpiry > 0) {
			return "weeks";
		}

		return "days";
	};

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
					<div class="space-y-8">
						<div class="space-y-2">
							<Typography
								variant="small"
								as="p"
								class="uppercase">
								Summary
							</Typography>

							<Typography variant="h3">
								Your latest travel document has the number{" "}
								<span
									// TODO: decoration color depending on time to expiry
									class="underline underline-offset-4 decoration-green-600">
									A1234123
								</span>{" "}
								and is due to expire in{" "}
								<span
									// TODO: decoration color depending on time to expiry
									class="underline underline-offset-4 decoration-green-600">
									{getDifference(new Date("12/12/2030"))}{" "}
									{getDifferenceUnit(new Date("12/12/2030"))}
								</span>
							</Typography>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
							<For each={passportApplications.data}>
								{item => {
									const getHref = () => {
										const url = new URL(location.origin);
										url.hash = location.hash;

										const searchParams =
											new URLSearchParams({
												automergeUrl: item.automergeUrl,
											});

										url.pathname =
											MyPassportForm.Edit.replace(
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
										<A href={getHref()} class="group">
											<Card class="h-full">
												<CardHeader>
													<Tooltip>
														<TooltipTrigger
															as={CardTitle}
															class="truncate">
															{
																item
																	.personalDetails
																	.firstName
															}
															&nbsp;
															{
																item
																	.personalDetails
																	.lastName
															}
														</TooltipTrigger>
														<TooltipContent>
															{
																item
																	.personalDetails
																	.firstName
															}
															&nbsp;
															{
																item
																	.personalDetails
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
																<span class="flex size-2 translate-y-[0.23rem] bg-cyan-500 dark:bg-cyan-600" />

																<div class="space-y-2">
																	<Typography
																		variant="small"
																		as="p">
																		{
																			item.label
																		}
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
													<Button class="w-full group-hover:bg-primary/90">
														Edit
													</Button>
												</CardFooter>
											</Card>
										</A>
									);
								}}
							</For>
						</div>
					</div>
				</Show>
			</Show>
		</div>
	);
};
