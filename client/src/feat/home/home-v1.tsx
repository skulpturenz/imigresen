import type { ColumnDef } from "@tanstack/solid-table";
import { MyPassportForm } from "core/constants/my-passport-form-route.enum";
import { AuthnContext } from "core/context/authn";
import { useI18n } from "core/context/i18n";
import { useContext } from "core/context/utils";
import { toPath } from "core/router/utils";
import { generatePath } from "core/utils";
import {
	differenceInDays,
	differenceInMonths,
	differenceInWeeks,
	differenceInYears,
	formatDate,
	isBefore,
} from "date-fns";
import { invariant } from "es-toolkit";
import { CircleAlert, Eye, Plus } from "lucide-solid";
import { createSignal, Show, Suspense } from "solid-js";
import { Alert, AlertDescription, AlertTitle } from "ui/alert";
import { Badge } from "ui/badge";
import { Button } from "ui/button";
import { CardContent, CardHeader, CardTitle } from "ui/card";
import { Label } from "ui/label";
import { Progress, ProgressLabel, ProgressValueLabel } from "ui/progress";
import { DataTable } from "ui/table/data-table";
import { TextField, TextFieldRoot } from "ui/text-field";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui/tooltip";
import { Typography } from "ui/typography";
import { usePassportApplications } from "./hooks/use-passport-applications";
import type { resources } from "./resources/i18n/en-us";
import { MyPassportFormStatus, type RegisteredMyPassportForm } from "./types";

export const Home = () => {
	const authnContext = useContext(AuthnContext);

	const {
		show: _show,
		qPassportApplications,
		mImportApplications: _mImportApplications,
		onClickImportApplications: _onClickImportApplications,
		onClickExportApplications,
		onClickCloseExportApplications: _onClickCloseExportApplications,
		mDownloadApplications: _mDownloadApplications,
		toggleImportDialog,
		prefetchReferenceData,
		getCurrentApplication,
		getPreviousApplications,
		getLatestIssuedApplication,
	} = usePassportApplications();

	// TODO
	const [_files, _setFiles] = createSignal<File[]>([]);
	// const _onFilesChange = (event: any) => {
	// 	const selected: File[] = Array.from(event.target.files);

	// 	setFiles(selected);
	// };

	const [search, setSearch] = createSignal("");

	const t = useI18n<typeof resources>();

	const getDifference = (expiryDate: Date) => {
		invariant(
			!isBefore(
				expiryDate.toLocaleDateString("en-us"),
				new Date().toLocaleDateString("en-us"),
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
				expiryDate.toLocaleDateString("en-us"),
				new Date().toLocaleDateString("en-us"),
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

	const getProgressByStatus = (status: MyPassportFormStatus) => {
		const progress = [
			MyPassportFormStatus.Draft,
			MyPassportFormStatus.Ready,
			MyPassportFormStatus.Submitted,
			MyPassportFormStatus.Issued,
		];

		const currentStatusIdx = progress.findIndex(x => x === status);
		invariant(currentStatusIdx !== -1, "Invalid status");

		return ((currentStatusIdx + 1) / progress.length) * 100;
	};
	const toLabel = (status: MyPassportFormStatus) => {
		const statusLabelMap = {
			[MyPassportFormStatus.Draft]: "Draft",
			[MyPassportFormStatus.Ready]: "Ready",
			[MyPassportFormStatus.Submitted]: "Submitted",
			[MyPassportFormStatus.Issued]: "Issued",
		};

		const label = statusLabelMap[status];
		invariant(label, "Unknown status");

		return label;
	};
	const getHref = (application: RegisteredMyPassportForm) => {
		const url = new URL(location.origin);
		url.hash = location.hash;

		const searchParams = new URLSearchParams({
			automergeUrl: application.automergeUrl,
		});

		url.pathname = generatePath(MyPassportForm.Edit, {
			uuid: application.uuid,
		});
		url.search = searchParams.toString();

		return url.href;
	};
	const getViewApplicationHref = () => {
		if (getCurrentApplication()) {
			return getHref(getCurrentApplication() as RegisteredMyPassportForm);
		}

		if (getLatestIssuedApplication()?.automergeUrl) {
			return getHref(
				getLatestIssuedApplication() as RegisteredMyPassportForm,
			);
		}

		return null;
	};

	const columns: ColumnDef<RegisteredMyPassportForm>[] = [
		{
			accessorKey: "applicationDetails.requestType",
			header: "Application type",
		},
		{
			accessorKey: "applicationDetails.documentType",
			header: "Document type",
		},
		{
			id: "name",
			accessorFn: row =>
				[row.personalDetails.firstName, row.personalDetails.lastName]
					.filter(Boolean)
					.join(" "),
			header: "Name",
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ getValue }) => {
				return <Badge>{getValue<string>()}</Badge>;
			},
		},
		{
			accessorKey: "issuedAt",
			accessorFn: row => {
				if (!row.issuedAt) {
					return "";
				}

				return formatDate(row.issuedAt, "dd-MM-yyyy");
			},
			header: "Date issued",
		},
		{
			id: "actions",
			header: "Actions",
			enableSorting: false,
			cell: () => {
				return (
					<>
						<Button variant="ghost" size="icon">
							<Eye />
						</Button>
					</>
				);
			},
		},
	];

	return (
		<>
			<div class="flex justify-end gap-4 my-8">
				<Show when={!authnContext().keycloak?.token}>
					<Show when={!qPassportApplications.data?.length}>
						<Button
							variant="secondary"
							onClick={toggleImportDialog}>
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

				<Button
					as="a"
					href={toPath(MyPassportForm.New)}
					onMouseOver={prefetchReferenceData}>
					<Plus />

					{t("doApply")}
				</Button>
			</div>

			<Suspense fallback={<div>Loading...</div>}>
				<Show
					// TODO: in this case show form to enter current passport details
					when={!qPassportApplications.data?.length}>
					<Typography variant="h3" class="text-center">
						No applications yet!
					</Typography>
				</Show>

				<Show
					// TODO
					when={qPassportApplications.data?.length}>
					<div class="space-y-8">
						<Show when={!authnContext().keycloak?.token}>
							<Alert>
								<CircleAlert class="size-4" />

								<AlertTitle>{t("exportAlertTitle")}</AlertTitle>

								<AlertDescription>
									{t("exportAlertDescription")}
								</AlertDescription>
							</Alert>
						</Show>

						<div>
							<Show
								when={
									getLatestIssuedApplication() ||
									getCurrentApplication()
								}>
								<CardHeader class="flex-row items-center justify-between">
									<div>
										<CardTitle>
											Current application
										</CardTitle>
									</div>

									<Show when={getViewApplicationHref()}>
										<div>
											<Button
												size="sm"
												variant="secondary"
												as="a"
												href={
													getViewApplicationHref() as string
												}>
												<div>
													<Eye />
												</div>
												View application
											</Button>
										</div>
									</Show>
								</CardHeader>
							</Show>

							<CardContent class="space-y-8">
								<Show when={getLatestIssuedApplication()}>
									<Typography variant="h4">
										<Show
											when={
												getDifferenceUnit(
													getLatestIssuedApplication()
														?.issuedAt as Date,
												) === "today"
											}>
											<div>
												Your latest travel document has
												the number&nbsp; A1234123 &nbsp;
												and is due to expire &nbsp;
												today
											</div>
										</Show>

										<Show
											when={
												getDifferenceUnit(
													getLatestIssuedApplication()
														?.issuedAt as Date,
												) !== "today"
											}>
											<div>
												Your latest travel document has
												the number A1234123 and is due
												to expire in&nbsp;
												<Tooltip>
													<TooltipTrigger as="span">
														{getDifference(
															getLatestIssuedApplication()
																?.issuedAt as Date,
														)}
														&nbsp;
														{getDifferenceUnit(
															getLatestIssuedApplication()
																?.issuedAt as Date,
														)}
													</TooltipTrigger>

													<TooltipContent>
														{(
															getLatestIssuedApplication()
																?.issuedAt as Date
														).toDateString()}
													</TooltipContent>
												</Tooltip>
											</div>
										</Show>
									</Typography>
								</Show>

								<Show when={getCurrentApplication()}>
									<div class="grid grid-cols-2 gap-4">
										<div>
											<Label class="text-muted-foreground">
												Application type
											</Label>

											<Show
												when={
													getCurrentApplication()
														?.applicationDetails
														?.requestType
												}>
												<div>
													{
														getCurrentApplication()
															?.applicationDetails
															?.requestType
													}
												</div>
											</Show>

											<Show
												when={
													!getCurrentApplication()
														?.applicationDetails
														?.requestType
												}>
												<div class="text-muted-foreground">
													Placeholder
												</div>
											</Show>
										</div>

										<div>
											<Label class="text-muted-foreground">
												Document type
											</Label>

											<Show
												when={
													getCurrentApplication()
														?.applicationDetails
														?.documentType
												}>
												<div>
													{
														getCurrentApplication()
															?.applicationDetails
															?.documentType
													}
												</div>
											</Show>

											<Show
												when={
													!getCurrentApplication()
														?.applicationDetails
														?.documentType
												}>
												<div class="text-muted-foreground">
													Placeholder
												</div>
											</Show>
										</div>

										<div>
											<Label class="text-muted-foreground">
												Applicant Name
											</Label>

											<Show
												when={
													getCurrentApplication()
														?.personalDetails
														?.firstName ||
													getCurrentApplication()
														?.personalDetails
														?.lastName
												}>
												<div>
													{[
														getCurrentApplication()
															?.personalDetails
															?.firstName,
														getCurrentApplication()
															?.personalDetails
															?.lastName,
													]
														.filter(Boolean)
														.join(" ")}
												</div>
											</Show>

											<Show
												when={
													!getCurrentApplication()
														?.personalDetails
														?.firstName &&
													!getCurrentApplication()
														?.personalDetails
														?.lastName
												}>
												<div class="text-muted-foreground">
													Placeholder
												</div>
											</Show>
										</div>

										<div>
											<Label class="text-muted-foreground">
												Status
											</Label>

											<div>
												<Badge>
													{toLabel(
														getCurrentApplication()
															?.status as MyPassportFormStatus,
													)}
												</Badge>
											</div>
										</div>
									</div>

									<div class="flex flex-col gap-2">
										<Progress
											value={getProgressByStatus(
												getCurrentApplication()
													?.status as MyPassportFormStatus,
											)}>
											<div class="flex justify-between">
												<ProgressLabel>
													Progress
												</ProgressLabel>
												<ProgressValueLabel />
											</div>
										</Progress>

										<div class="flex justify-between">
											<Label description>Draft</Label>

											<Label description>Ready</Label>

											<Label description>Submitted</Label>

											<Label description>Issued</Label>
										</div>
									</div>
								</Show>
							</CardContent>
						</div>

						<Show when={getPreviousApplications().length > 0}>
							<div>
								<CardHeader>
									<CardTitle>Past applications</CardTitle>
								</CardHeader>

								<CardContent class="flex flex-col gap-4">
									<TextFieldRoot>
										<TextField
											type="text"
											placeholder="Search ..."
											// TODO
											onInput={event =>
												setSearch(
													(
														event.target as HTMLInputElement
													).value,
												)
											}
										/>
									</TextFieldRoot>

									<DataTable
										columns={columns}
										rows={getPreviousApplications}
										isRowSelectable={false}
										search={search}
									/>
								</CardContent>
							</div>
						</Show>
					</div>
				</Show>
			</Suspense>
		</>
	);

	// return (
	// 	<div>
	// 		<div class="flex justify-end gap-4 my-8">
	// 			<Show when={!authnContext().keycloak?.token}>
	// 				<Show when={!qPassportApplications.data?.length}>
	// 					<Button
	// 						variant="secondary"
	// 						onClick={toggleImportDialog}>
	// 						{t("doImport")}
	// 					</Button>
	// 				</Show>

	// 				<Show when={qPassportApplications.data?.length}>
	// 					<Button
	// 						variant="secondary"
	// 						onClick={onClickExportApplications}>
	// 						{t("doExport")}
	// 					</Button>
	// 				</Show>
	// 			</Show>

	// 			<Button
	// 				as="a"
	// 				href={toPath(MyPassportForm.New)}
	// 				onMouseOver={prefetchReferenceData}>
	// 				{t("doApply")}
	// 			</Button>
	// 		</div>

	// 		<Suspense fallback={<div>Loading...</div>}>
	// 			<Show when={!qPassportApplications.data?.length}>
	// 				<Typography variant="h3" class="text-center">
	// 					No applications yet!
	// 				</Typography>
	// 			</Show>

	// 			<Show when={qPassportApplications.data?.length}>
	// 				<div class="space-y-8">
	// 					<Show when={!authnContext().keycloak?.token}>
	// 						<Alert>
	// 							<CircleAlert class="size-4" />

	// 							<AlertTitle>{t("exportAlertTitle")}</AlertTitle>

	// 							<AlertDescription>
	// 								{t("exportAlertDescription")}
	// 							</AlertDescription>
	// 						</Alert>
	// 					</Show>

	// 					<div class="space-y-2">
	// 						<Typography
	// 							variant="small"
	// 							as="p"
	// 							class="uppercase">
	// 							Summary
	// 						</Typography>

	// 						<Show
	// 							when={
	// 								getDifferenceUnit(randomDate) === "today"
	// 							}>
	// 							<Typography variant="h3">
	// 								Your latest travel document has the
	// 								number&nbsp;
	// 								<span class="underline underline-offset-4 decoration-red-500 dark:decoration-red-900">
	// 									A1234123
	// 								</span>
	// 								&nbsp; and is due to expire &nbsp;
	// 								<span class="underline underline-offset-4 decoration-red-500 dark:decoration-red-900">
	// 									today
	// 								</span>
	// 							</Typography>
	// 						</Show>

	// 						<Show
	// 							when={
	// 								getDifferenceUnit(randomDate) !== "today"
	// 							}>
	// 							<Typography variant="h3">
	// 								Your latest travel document has the
	// 								number&nbsp;
	// 								<span
	// 									class={cn(
	// 										"underline underline-offset-4",
	// 										{
	// 											"decoration-green-500 dark:decoration-green-900":
	// 												isValid(randomDate),
	// 											"decoration-yellow-500 dark:decoration-yellow-900":
	// 												isTimeToRenew(randomDate),
	// 											"decoration-red-500 dark:decoration-red-900":
	// 												isExpired(randomDate),
	// 										},
	// 									)}>
	// 									A1234123
	// 								</span>
	// 								&nbsp; and is due to expire in&nbsp;
	// 								<Tooltip>
	// 									<TooltipTrigger
	// 										as="span"
	// 										class={cn(
	// 											"underline underline-offset-4",
	// 											{
	// 												"decoration-green-500 dark:decoration-green-900":
	// 													isValid(randomDate),
	// 												"decoration-yellow-500 dark:decoration-yellow-900":
	// 													isTimeToRenew(
	// 														randomDate,
	// 													),
	// 												"decoration-red-500 dark:decoration-red-900":
	// 													isExpired(randomDate),
	// 											},
	// 										)}>
	// 										{getDifference(randomDate)}&nbsp;
	// 										{getDifferenceUnit(randomDate)}
	// 									</TooltipTrigger>

	// 									<TooltipContent>
	// 										{randomDate.toDateString()}
	// 									</TooltipContent>
	// 								</Tooltip>
	// 							</Typography>
	// 						</Show>
	// 					</div>

	// 					<div class="grid grid-cols-1 sm:grid-cols-2 gap-8 group">
	// 						<For each={qPassportApplications.data}>
	// 							{item => {
	// 								const getHref = () => {
	// 									const url = new URL(location.origin);
	// 									url.hash = location.hash;

	// 									const searchParams =
	// 										new URLSearchParams({
	// 											automergeUrl: item.automergeUrl,
	// 										});

	// 									url.pathname = generatePath(
	// 										MyPassportForm.Edit,
	// 										{
	// 											uuid: item.uuid,
	// 										},
	// 									);
	// 									url.search = searchParams.toString();

	// 									return url.href;
	// 								};

	// 								const details = [
	// 									{
	// 										label: "Email",
	// 										description: "test@test.com",
	// 									},
	// 									{
	// 										label: "Mobile number",
	// 										description: "0234567890",
	// 									},
	// 									{
	// 										label: "Document type",
	// 										description:
	// 											"Malaysian passport (64 pages)",
	// 									},
	// 									{
	// 										label: "Current document number",
	// 										description: "A1234124",
	// 									},
	// 									{
	// 										label: "Status",
	// 										description: "In progress",
	// 									},
	// 								];

	// 								return (
	// 									<A
	// 										href={getHref()}
	// 										class="group hover:scale-105 group-hover:not-hover:scale-95 transition-transform">
	// 										<Card class="h-full">
	// 											<CardHeader>
	// 												<Show
	// 													when={
	// 														item.personalDetails
	// 															.firstName ||
	// 														item.personalDetails
	// 															.lastName
	// 													}>
	// 													<Tooltip>
	// 														<TooltipTrigger
	// 															as={CardTitle}
	// 															class="truncate">
	// 															{[
	// 																item
	// 																	.personalDetails
	// 																	.firstName,
	// 																item
	// 																	.personalDetails
	// 																	.lastName,
	// 															]
	// 																.filter(
	// 																	Boolean,
	// 																)
	// 																.join(" ")}
	// 														</TooltipTrigger>
	// 														<TooltipContent>
	// 															{[
	// 																item
	// 																	.personalDetails
	// 																	.firstName,
	// 																item
	// 																	.personalDetails
	// 																	.lastName,
	// 															]
	// 																.filter(
	// 																	Boolean,
	// 																)
	// 																.join(" ")}
	// 														</TooltipContent>
	// 													</Tooltip>
	// 												</Show>

	// 												<Show
	// 													when={
	// 														!item
	// 															.personalDetails
	// 															.firstName &&
	// 														!item
	// 															.personalDetails
	// 															.lastName
	// 													}>
	// 													<CardTitle class="text-muted-foreground">
	// 														{[
	// 															randFirstName(),
	// 															randLastName(),
	// 														].join(" ")}
	// 													</CardTitle>
	// 												</Show>

	// 												<CardDescription>
	// 													Malaysian passport
	// 												</CardDescription>
	// 											</CardHeader>
	// 											<CardContent>
	// 												<For each={details}>
	// 													{item => (
	// 														<div class="mb-4 grid grid-cols-[20px_1fr] items-start pb-4 last:mb-0 last:pb-0">
	// 															<div class="space-y-2">
	// 																<div class="grid grid-cols-3 gap-4 items-center">
	// 																	<div class="col-span-1">
	// 																		<span class="flex col-span-1 size-2 bg-sky-500 dark:bg-sky-900" />
	// 																	</div>

	// 																	<Typography
	// 																		variant="small"
	// 																		as="p"
	// 																		class="w-full col-span-2 text-nowrap">
	// 																		{
	// 																			item.label
	// 																		}
	// 																	</Typography>
	// 																</div>

	// 																<Typography
	// 																	variant="small"
	// 																	as="p"
	// 																	class="text-nowrap mx-4">
	// 																	{
	// 																		item.description
	// 																	}
	// 																</Typography>
	// 															</div>
	// 														</div>
	// 													)}
	// 												</For>
	// 											</CardContent>

	// 											<CardFooter>
	// 												<Button class="w-full group-hover:bg-primary/90">
	// 													Edit
	// 												</Button>
	// 											</CardFooter>
	// 										</Card>
	// 									</A>
	// 								);
	// 							}}
	// 						</For>
	// 					</div>
	// 				</div>
	// 			</Show>

	// 			<AlertDialog
	// 				open={show().failedToExportDialog}
	// 				onOpenChange={onClickCloseExportApplications}>
	// 				<AlertDialogContent>
	// 					<AlertDialogHeader>
	// 						<AlertDialogTitle>
	// 							{t("exportFailedDialogTitle")}
	// 						</AlertDialogTitle>
	// 						<AlertDialogDescription>
	// 							{t("exportFailedDialogDescription", [
	// 								...(mDownloadApplications.data
	// 									?.invalidUrls ?? []),
	// 							])}
	// 						</AlertDialogDescription>
	// 					</AlertDialogHeader>
	// 					<AlertDialogFooter>
	// 						<AlertDialogClose
	// 							onClick={onClickCloseExportApplications}>
	// 							{t("doCloseExportFailedDialog")}
	// 						</AlertDialogClose>
	// 					</AlertDialogFooter>
	// 				</AlertDialogContent>
	// 			</AlertDialog>

	// 			<Dialog
	// 				open={show().importDialog}
	// 				onOpenChange={toggleImportDialog}>
	// 				<DialogContent>
	// 					<DialogHeader>
	// 						<DialogTitle>{t("importDialogTitle")}</DialogTitle>
	// 						<DialogDescription>
	// 							{t("importDialogDescription")}
	// 						</DialogDescription>

	// 						<div class="h-20 border border-border border-dashed mt-2 flex justify-center items-center">
	// 							<Typography variant="small">
	// 								Drop files here
	// 							</Typography>
	// 						</div>

	// 						<input
	// 							// TODO: proper file input
	// 							type="file"
	// 							multiple
	// 							onChange={onFilesChange}
	// 						/>
	// 					</DialogHeader>
	// 					<DialogFooter>
	// 						<Button
	// 							variant="secondary"
	// 							onClick={toggleImportDialog}>
	// 							<Show when={mImportApplications.isSuccess}>
	// 								{t("doFinishImport")}
	// 							</Show>

	// 							<Show when={mImportApplications.isIdle}>
	// 								{t("doCloseImportDialog")}
	// 							</Show>
	// 						</Button>

	// 						<Button
	// 							onClick={partial(
	// 								onClickImportApplications,
	// 								files(),
	// 							)}
	// 							disabled={
	// 								!files().length ||
	// 								mImportApplications.isPending
	// 							}>
	// 							{t("doImportApplication")}
	// 						</Button>
	// 					</DialogFooter>
	// 				</DialogContent>
	// 			</Dialog>
	// 		</Suspense>
	// 	</div>
	// );
};
