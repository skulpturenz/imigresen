import { randBetweenDate, randFirstName, randLastName } from "@ngneat/falso";
import { A } from "@solidjs/router";
import { MyPassportForm } from "core/constants/my-passport-form-route.enum";
import { AuthnContext } from "core/context/authn";
import { useI18n } from "core/context/i18n";
import { useContext } from "core/context/utils";
import { toPath } from "core/router/route";
import { generatePath } from "core/utils/utils";
import {
	addYears,
	differenceInDays,
	differenceInMonths,
	differenceInWeeks,
	differenceInYears,
	isBefore,
} from "date-fns";
import { invariant } from "es-toolkit";
import { CircleAlert } from "lucide-solid";
import { For, Show, Suspense } from "solid-js";
import { Alert, AlertDescription, AlertTitle } from "ui/alert";
import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "ui/alert-dialog";
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
import { cn } from "ui/utils";
import { usePassportApplications } from "./hooks/usePassportApplications";
import type { resources } from "./resources/i18n/en-US";

export const Home = () => {
	const authnContext = useContext(AuthnContext);

	const {
		qPassportApplications,
		onClickExportApplications,
		mDownloadApplications,
	} = usePassportApplications();
	const t = useI18n<typeof resources>();

	const getDifference = (expiryDate: Date) => {
		invariant(
			!isBefore(
				expiryDate.toLocaleDateString("en-US"),
				new Date().toLocaleDateString("en-US"),
			),
			"Expiry date must be greater than or equal to today",
		);

		const yearsToExpiry = differenceInYears(expiryDate, new Date());
		if (yearsToExpiry > 1) {
			return yearsToExpiry;
		}

		const monthsToExpiry = differenceInMonths(expiryDate, new Date());
		if (monthsToExpiry > 1) {
			return monthsToExpiry;
		}

		const weeksToExpiry = differenceInWeeks(expiryDate, new Date());
		if (weeksToExpiry > 1) {
			return weeksToExpiry;
		}

		const daysToExpiry = differenceInDays(expiryDate, new Date());
		return daysToExpiry;
	};

	const getDifferenceUnit = (expiryDate: Date) => {
		invariant(
			!isBefore(
				expiryDate.toLocaleDateString("en-US"),
				new Date().toLocaleDateString("en-US"),
			),
			"Expiry date must be greater than or equal to today",
		);

		const yearsToExpiry = differenceInYears(expiryDate, new Date());
		if (yearsToExpiry > 1) {
			return "years";
		}

		const monthsToExpiry = differenceInMonths(expiryDate, new Date());
		if (monthsToExpiry > 1) {
			return "months";
		}

		const weeksToExpiry = differenceInWeeks(expiryDate, new Date());
		if (weeksToExpiry > 1) {
			return "weeks";
		}

		const daysToExpiry = differenceInDays(expiryDate, new Date());
		if (daysToExpiry === 0) {
			return "today";
		}

		return "days";
	};

	const randomDate = randBetweenDate({
		from: new Date().toLocaleDateString("en-US"),
		to: addYears(new Date(), 5),
	});

	const isValid = (expiryDate: Date) =>
		getDifferenceUnit(expiryDate) === "years" ||
		(getDifferenceUnit(expiryDate) === "months" &&
			getDifference(expiryDate) > 6);

	const isTimeToRenew = (expiryDate: Date) =>
		getDifferenceUnit(expiryDate) === "months" &&
		getDifference(expiryDate) <= 6;

	const isExpired = (expiryDate: Date) =>
		getDifferenceUnit(expiryDate) !== "years" &&
		getDifferenceUnit(expiryDate) !== "months";

	return (
		<div>
			<div class="flex justify-end gap-4 my-8">
				<Show when={!authnContext().keycloak?.token}>
					<Show when={!qPassportApplications.data?.length}>
						<Button
							variant="secondary"
							onClick={onClickExportApplications}>
							{t("doImport")}
						</Button>
					</Show>

					<Show when={qPassportApplications.data?.length}>
						<Button
							variant="secondary"
							onClick={onClickExportApplications}>
							{t("doExport")}
						</Button>
					</Show>
				</Show>

				<Button as="a" href={toPath(MyPassportForm.New)}>
					{t("doApply")}
				</Button>
			</div>

			<Suspense fallback={<div>Loading...</div>}>
				<Show when={!qPassportApplications.data?.length}>
					<Typography variant="h3" class="text-center">
						No applications yet!
					</Typography>
				</Show>

				<Show when={qPassportApplications.data?.length}>
					<div class="space-y-8">
						<Show when={!authnContext().keycloak?.token}>
							<Alert>
								<CircleAlert class="size-4" />

								<AlertTitle>{t("exportAlertTitle")}</AlertTitle>

								<AlertDescription>
									{t("exportAlertDescription")}
								</AlertDescription>
							</Alert>

							<AlertDialog
								open={Boolean(
									mDownloadApplications.data?.invalidUrls
										.length,
								)}>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											{t("exportFailedDialogTitle")}
										</AlertDialogTitle>
										<AlertDialogDescription>
											{t(
												"exportFailedDialogDescription",
												[
													...(mDownloadApplications
														.data?.invalidUrls ??
														[]),
												],
											)}
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogClose
											onClick={
												mDownloadApplications.reset
											}>
											{t("doCloseExportFailedDialog")}
										</AlertDialogClose>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</Show>

						<div class="space-y-2">
							<Typography
								variant="small"
								as="p"
								class="uppercase">
								Summary
							</Typography>

							<Show
								when={
									getDifferenceUnit(randomDate) === "today"
								}>
								<Typography variant="h3">
									Your latest travel document has the
									number&nbsp;
									<span class="underline underline-offset-4 decoration-red-500 dark:decoration-red-900">
										A1234123
									</span>
									&nbsp; and is due to expire &nbsp;
									<span class="underline underline-offset-4 decoration-red-500 dark:decoration-red-900">
										today
									</span>
								</Typography>
							</Show>

							<Show
								when={
									getDifferenceUnit(randomDate) !== "today"
								}>
								<Typography variant="h3">
									Your latest travel document has the
									number&nbsp;
									<span
										class={cn(
											"underline underline-offset-4",
											{
												"decoration-green-500 dark:decoration-green-900":
													isValid(randomDate),
												"decoration-yellow-500 dark:decoration-yellow-900":
													isTimeToRenew(randomDate),
												"decoration-red-500 dark:decoration-red-900":
													isExpired(randomDate),
											},
										)}>
										A1234123
									</span>
									&nbsp; and is due to expire in&nbsp;
									<Tooltip>
										<TooltipTrigger
											as="span"
											class={cn(
												"underline underline-offset-4",
												{
													"decoration-green-500 dark:decoration-green-900":
														isValid(randomDate),
													"decoration-yellow-500 dark:decoration-yellow-900":
														isTimeToRenew(
															randomDate,
														),
													"decoration-red-500 dark:decoration-red-900":
														isExpired(randomDate),
												},
											)}>
											{getDifference(randomDate)}&nbsp;
											{getDifferenceUnit(randomDate)}
										</TooltipTrigger>

										<TooltipContent>
											{randomDate.toDateString()}
										</TooltipContent>
									</Tooltip>
								</Typography>
							</Show>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-8 group">
							<For each={qPassportApplications.data}>
								{item => {
									const getHref = () => {
										const url = new URL(location.origin);
										url.hash = location.hash;

										const searchParams =
											new URLSearchParams({
												automergeUrl: item.automergeUrl,
											});

										url.pathname = generatePath(
											MyPassportForm.Edit,
											{
												uuid: item.uuid,
											},
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
										<A
											href={getHref()}
											class="group hover:scale-105 group-hover:not-hover:scale-95 transition-transform">
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
			</Suspense>
		</div>
	);
};
