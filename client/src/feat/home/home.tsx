import { randFirstName, randLastName } from "@ngneat/falso";
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
									class="underline underline-offset-4 decoration-green-500 dark:decoration-green-900">
									A1234123
								</span>{" "}
								and is due to expire in{" "}
								<span
									// TODO: decoration color depending on time to expiry
									class="underline underline-offset-4 decoration-green-500 dark:decoration-green-900">
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
													<Show
														when={
															item.personalDetails
																.firstName ||
															item.personalDetails
																.lastName
														}>
														<Tooltip>
															<TooltipTrigger
																as={CardTitle}
																class="truncate">
																{[
																	item
																		.personalDetails
																		.firstName,
																	item
																		.personalDetails
																		.lastName,
																]
																	.filter(
																		Boolean,
																	)
																	.join(" ")}
															</TooltipTrigger>
															<TooltipContent>
																{[
																	item
																		.personalDetails
																		.firstName,
																	item
																		.personalDetails
																		.lastName,
																]
																	.filter(
																		Boolean,
																	)
																	.join(" ")}
															</TooltipContent>
														</Tooltip>
													</Show>

													<Show
														when={
															!item
																.personalDetails
																.firstName &&
															!item
																.personalDetails
																.lastName
														}>
														<CardTitle class="text-muted-foreground">
															{[
																randFirstName(),
																randLastName(),
															].join(" ")}
														</CardTitle>
													</Show>

													<CardDescription>
														Malaysian passport
													</CardDescription>
												</CardHeader>
												<CardContent>
													<For each={details}>
														{item => (
															<div class="mb-4 grid grid-cols-[20px_1fr] items-start pb-4 last:mb-0 last:pb-0">
																<div class="space-y-2">
																	<div class="grid grid-cols-3 gap-4 items-center">
																		<div class="col-span-1">
																			<span class="flex col-span-1 size-2 bg-sky-500 dark:bg-sky-900" />
																		</div>

																		<Typography
																			variant="small"
																			as="p"
																			class="w-full col-span-2 text-nowrap">
																			{
																				item.label
																			}
																		</Typography>
																	</div>

																	<Typography
																		variant="small"
																		as="p"
																		class="text-nowrap mx-4">
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
