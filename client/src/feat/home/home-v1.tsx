import type {
	CellContext,
	ColumnDef,
	ColumnDefTemplate,
} from "@tanstack/solid-table";
import { MyPassportForm } from "core/constants/my-passport-form-route.enum";
import { storageKeys } from "core/constants/storage-keys";
import { AuthnContext } from "core/context/authn";
import { useI18n } from "core/context/i18n";
import { UserContext } from "core/context/user";
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
import { invariant, partial } from "es-toolkit";
import { CircleAlert, Eye, Plus } from "lucide-solid";
import { createSignal, onMount, Show, Suspense } from "solid-js";
import type { JSX } from "solid-js/h/jsx-runtime";
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
import { Badge } from "ui/badge";
import { Button } from "ui/button";
import { CardContent, CardHeader, CardTitle } from "ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "ui/dialog";
import { Label } from "ui/label";
import { Progress, ProgressLabel, ProgressValueLabel } from "ui/progress";
import { DataTable } from "ui/table/data-table";
import { TextField, TextFieldRoot } from "ui/text-field";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui/tooltip";
import { Typography } from "ui/typography";
import { MyPassportFormWizard } from "./external";
import { usePassportApplications } from "./hooks/use-passport-applications";
import type { resources } from "./resources/i18n/en-us";
import img from "./test.jpg";
import {
	MyPassportFormStatus,
	type IssuedMyPassportForm,
	type PersistedMyPassportForm,
} from "./types";
// eslint-disable-next-line import/no-namespace
import * as automl from "@tensorflow/tfjs-automl";
import { models } from "core/models";

export const Home = () => {
	const authnContext = useContext(AuthnContext);
	const userContext = useContext(UserContext);

	const {
		show: show,
		qPassportApplications,
		mImportApplications: mImportApplications,
		onClickImportApplications: onClickImportApplications,
		onClickExportApplications,
		onClickCloseExportApplications: onClickCloseExportApplications,
		mDownloadApplications: mDownloadApplications,
		toggleImportDialog,
		prefetchReferenceData,
		getCurrentApplication,
		getPreviousApplications,
		getLatestIssuedApplication,
	} = usePassportApplications();

	// TODO
	const [files, setFiles] = createSignal<File[]>([]);
	const onFilesChange = (event: any) => {
		const selected: File[] = Array.from(event.target.files);

		setFiles(selected);
	};

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
			return t("timeUnit.years");
		}

		const monthsToExpiry = differenceInMonths(expiryDate, new Date());
		if (monthsToExpiry > 1) {
			return t("timeUnit.months");
		}

		const weeksToExpiry = differenceInWeeks(expiryDate, new Date());
		if (weeksToExpiry > 1) {
			return t("timeUnit.weeks");
		}

		const daysToExpiry = differenceInDays(expiryDate, new Date());
		if (daysToExpiry === 0) {
			return t("timeUnit.today");
		}

		return t("timeUnit.days");
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
			[MyPassportFormStatus.Draft]: t("status.draft"),
			[MyPassportFormStatus.Ready]: t("status.ready"),
			[MyPassportFormStatus.Submitted]: t("status.submitted"),
			[MyPassportFormStatus.Issued]: t("status.issued"),
		};

		const label = statusLabelMap[status];
		invariant(label, "Unknown status");

		return label;
	};
	const getHref = (application: PersistedMyPassportForm) => {
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
			return getHref(getCurrentApplication() as PersistedMyPassportForm);
		}

		if (getLatestIssuedApplication()?.automergeUrl) {
			return getHref(
				getLatestIssuedApplication() as PersistedMyPassportForm,
			);
		}

		return null;
	};

	const renderColumn: ColumnDefTemplate<CellContext<any, any>> = ({
		getValue,
	}) => {
		if (!getValue()) {
			return (
				<span class="text-muted-foreground">{t("placeholder")}</span>
			);
		}

		return getValue();
	};

	const toName = (firstName?: string, lastName?: string) =>
		[firstName, lastName].filter(Boolean).join(" ");

	const columns: ColumnDef<PersistedMyPassportForm>[] = [
		{
			accessorKey: "applicationDetails.requestType",
			header: t("pastApplications.tableColumns.requestType"),
			cell: renderColumn,
		},
		{
			accessorKey: "applicationDetails.documentType",
			header: t("pastApplications.tableColumns.documentType"),
			cell: renderColumn,
		},
		{
			id: "name",
			accessorFn: row =>
				toName(
					row.personalDetails.firstName,
					row.personalDetails.lastName,
				),
			header: t("pastApplications.tableColumns.name"),
			cell: renderColumn,
		},
		{
			accessorKey: "status",
			header: t("pastApplications.tableColumns.status"),
			cell: ({ getValue }) => {
				return (
					<Badge>{toLabel(getValue<MyPassportFormStatus>())}</Badge>
				);
			},
		},
		{
			accessorKey: "issuedAt",
			accessorFn: row => {
				if (row.status !== MyPassportFormStatus.Issued) {
					return "";
				}

				return formatDate(row.issuedAt, "dd-MM-yyyy");
			},
			header: t("pastApplications.tableColumns.dateIssued"),
			cell: renderColumn,
		},
		{
			id: "actions",
			header: t("pastApplications.tableColumns.actions"),
			enableSorting: false,
			cell: ({ row }) => {
				return (
					<div class="flex gap-2 items-center">
						<Button
							as="a"
							variant="ghost"
							size="icon"
							href={getHref(row.original)}>
							<Eye />
						</Button>
					</div>
				);
			},
		},
	];

	const Onboarding = () => {
		return (
			<>
				<Typography
					variant="h2"
					class="flex flex-col md:flex-row gap-4 justify-between items-center">
					<span class="max-w-full md:max-w-full self-start md:self-center">
						{t("onboarding.title")}
					</span>

					<div class="flex w-full md:max-w-min gap-2">
						<Button
							variant="outline"
							class="w-full md:max-w-min"
							onClick={toggleImportDialog}>
							{t("doImport")}
						</Button>
					</div>
				</Typography>

				<Typography variant="p" class="whitespace-pre-line">
					{t("onboarding.description")}
				</Typography>

				<MyPassportFormWizard />
			</>
		);
	};

	const ActionBar = () => {
		return (
			<>
				<div class="flex justify-end gap-4 my-8">
					<Show when={!authnContext().keycloak?.token}>
						<Show when={qPassportApplications.data?.length}>
							<Button
								variant="secondary"
								onClick={onClickExportApplications}>
								{t("doExport")}
							</Button>
						</Show>
					</Show>

					<Show when={qPassportApplications.data?.length}>
						<Button
							as="a"
							href={toPath(MyPassportForm.New)}
							onMouseOver={prefetchReferenceData}>
							<Plus />

							{t("doApply")}
						</Button>
					</Show>
				</div>
			</>
		);
	};

	const CurrentApplication = () => {
		return (
			<>
				<div>
					<Show
						when={
							getLatestIssuedApplication() ||
							getCurrentApplication()
						}>
						<CardHeader class="flex-row items-center justify-between">
							<div>
								<CardTitle>
									{t("currentApplication.title")}
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
										{t(
											"currentApplication.doViewApplication",
										)}
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
										{t(
											"currentApplication.summary.expiresToday",
											getLatestIssuedApplication() as IssuedMyPassportForm,
										)}
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
										{t(
											"currentApplication.summary.expiresIn",
											getLatestIssuedApplication() as IssuedMyPassportForm,
										)}
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
										{t(
											"currentApplication.applicationType",
										)}
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
											{t("placeholder")}
										</div>
									</Show>
								</div>

								<div>
									<Label class="text-muted-foreground">
										{t("currentApplication.documentType")}
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
											{t("placeholder")}
										</div>
									</Show>
								</div>

								<div>
									<Label class="text-muted-foreground">
										{t("currentApplication.name")}
									</Label>

									<Show
										when={
											getCurrentApplication()
												?.personalDetails?.firstName ||
											getCurrentApplication()
												?.personalDetails?.lastName
										}>
										<div>
											{[
												getCurrentApplication()
													?.personalDetails
													?.firstName,
												getCurrentApplication()
													?.personalDetails?.lastName,
											]
												.filter(Boolean)
												.join(" ")}
										</div>
									</Show>

									<Show
										when={
											!getCurrentApplication()
												?.personalDetails?.firstName &&
											!getCurrentApplication()
												?.personalDetails?.lastName
										}>
										<div class="text-muted-foreground">
											{t("placeholder")}
										</div>
									</Show>
								</div>

								<div>
									<Label class="text-muted-foreground">
										{t("currentApplication.status")}
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
											{t("currentApplication.progress")}
										</ProgressLabel>

										<ProgressValueLabel />
									</div>
								</Progress>

								<div class="flex justify-between">
									<Label description>
										{t("status.draft")}
									</Label>

									<Label description>
										{t("status.ready")}
									</Label>

									<Label description>
										{t("status.submitted")}
									</Label>

									<Label description>
										{t("status.issued")}
									</Label>
								</div>
							</div>
						</Show>
					</CardContent>
				</div>
			</>
		);
	};

	const PastApplications = () => {
		const onInputSearch: JSX.EventHandlerUnion<
			HTMLInputElement,
			InputEvent
		> = event => {
			const value = (event.target as HTMLInputElement).value;

			setSearch(value);
		};

		return (
			<>
				<div>
					<CardHeader>
						<CardTitle>{t("pastApplications.title")}</CardTitle>
					</CardHeader>

					<CardContent class="flex flex-col gap-4">
						<TextFieldRoot>
							<TextField
								type="text"
								placeholder={t(
									"pastApplications.placeholderSearch",
								)}
								onInput={onInputSearch}
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
			</>
		);
	};

	const ExportBanner = () => {
		return (
			<>
				<Alert>
					<CircleAlert class="size-4" />

					<AlertTitle>{t("exportAlertTitle")}</AlertTitle>

					<AlertDescription>
						{t("exportAlertDescription")}
					</AlertDescription>
				</Alert>
			</>
		);
	};

	const ExportDialog = () => {
		return (
			<>
				<AlertDialog
					open={show().failedToExportDialog}
					onOpenChange={onClickCloseExportApplications}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								{t("exportFailedDialogTitle")}
							</AlertDialogTitle>
							<AlertDialogDescription>
								{t("exportFailedDialogDescription", [
									...(mDownloadApplications.data
										?.invalidUrls ?? []),
								])}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogClose
								onClick={onClickCloseExportApplications}>
								{t("doCloseExportFailedDialog")}
							</AlertDialogClose>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</>
		);
	};

	const ImportDialog = () => {
		return (
			<>
				<Dialog
					open={show().importDialog}
					onOpenChange={toggleImportDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("importDialogTitle")}</DialogTitle>
							<DialogDescription>
								{t("importDialogDescription")}
							</DialogDescription>

							<div class="h-20 border border-border border-dashed mt-2 flex justify-center items-center">
								<Typography variant="small">
									Drop files here
								</Typography>
							</div>

							<input
								// TODO: proper file input
								type="file"
								multiple
								onChange={onFilesChange}
							/>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="secondary"
								onClick={toggleImportDialog}>
								<Show when={mImportApplications.isSuccess}>
									{t("doFinishImport")}
								</Show>

								<Show when={mImportApplications.isIdle}>
									{t("doCloseImportDialog")}
								</Show>
							</Button>

							<Button
								onClick={partial(
									onClickImportApplications,
									files(),
								)}
								disabled={
									!files().length ||
									mImportApplications.isPending
								}>
								{t("doImportApplication")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		);
	};

	const isOnboarding = () =>
		!qPassportApplications.data?.length ||
		window.localStorage.getItem(
			storageKeys.onboardingFlag(userContext().profile?.uuid),
		);

	return (
		<>
			<TensorflowTest />
			<ActionBar />

			<Suspense fallback={<div>Loading...</div>}>
				<Show when={isOnboarding()}>
					<Onboarding />
				</Show>

				<Show when={!isOnboarding()}>
					<div class="space-y-8">
						<Show when={!authnContext().keycloak?.token}>
							<ExportBanner />
						</Show>

						<CurrentApplication />

						<Show when={getPreviousApplications().length > 0}>
							<PastApplications />
						</Show>
					</div>
				</Show>

				<ExportDialog />

				<ImportDialog />
			</Suspense>
		</>
	);
};

const TensorflowTest = () => {
	// eslint-disable-next-line prefer-const
	let image: HTMLImageElement | undefined = undefined;
	// eslint-disable-next-line prefer-const
	let cvs: HTMLCanvasElement | undefined = undefined;
	// eslint-disable-next-line prefer-const
	let div: HTMLDivElement | undefined = undefined;

	const model = { ref: null as automl.ObjectDetectionModel | null };

	const getModel = async () => {
		model.ref = await automl.loadObjectDetection(
			models.signverodAutomlEdge,
		);

		const predictions = await model.ref?.detect(image!, {
			score: 0.1,
			topk: 5,
		});

		// TODO: maybe allow the user to draw a box if the prediction is not good
		console.log(predictions);

		predictions
			?.filter(({ label }) => ["signature", "initials"].includes(label))
			.forEach(({ box, score, label }) => {
				const button = document.createElement("button");
				button.style.position = "absolute";
				button.style.top = `${box.top}px`;
				button.style.left = `${box.left}px`;
				button.style.width = `${box.width}px`;
				button.style.height = `${box.height}px`;
				button.style.backgroundColor = "transparent";
				button.style.zIndex = `${1000}`;
				button.style.cursor = "pointer";
				button.addEventListener("click", () => {
					console.log("HERE!!", score, label);
				});
				div!.appendChild(button);

				const ctx = cvs!.getContext("2d");
				ctx?.beginPath();
				ctx?.rect(box.left, box.top, box.width, box.height);
				ctx!.lineWidth = 3;
				ctx!.strokeStyle = "yellow";
				ctx?.stroke();
			});
	};

	onMount(() => {
		getModel();
	});

	return (
		<>
			<img
				ref={image}
				src={img}
				width={500}
				height={500}
				onLoad={async event => {
					cvs!.width = (event.target as HTMLImageElement).width;
					cvs!.height = (event.target as HTMLImageElement).height;

					const ctx = cvs!.getContext("2d");
					ctx!.drawImage(
						event.target as HTMLImageElement,
						0,
						0,
						(event.target as HTMLImageElement).width,
						(event.target as HTMLImageElement).height,
					);

					// const button = document.createElement("button");
					// button.style.position = "absolute";
					// button.style.top = `${50}px`;
					// button.style.left = `${50}px`;
					// button.style.width = `${100}px`;
					// button.style.height = `${100}px`;
					// button.style.backgroundColor = "transparent";
					// button.style.cursor = "pointer";
					// button.addEventListener("click", () => {
					// 	console.log("HERE!!");
					// });
					// div!.appendChild(button);

					// ctx?.beginPath();
					// ctx?.rect(50, 50, 100, 100);
					// ctx!.lineWidth = 3;
					// ctx!.strokeStyle = "yellow";
					// ctx?.stroke();

					// const predictions = await model.ref?.detect(
					// 	event.target as HTMLImageElement,
					// 	{
					// 		score: 0.3,
					// 		iou: 0.5,
					// 		topk: 5,
					// 	},
					// );

					// console.log(predictions, model);

					// predictions?.forEach(({ box, score, label }) => {
					// 	const button = document.createElement("button");
					// 	button.style.position = "absolute";
					// 	button.style.top = `${box.top}px`;
					// 	button.style.left = `${box.left}px`;
					// 	button.style.width = `${box.width}px`;
					// 	button.style.height = `${box.height}px`;
					// 	button.style.backgroundColor = "transparent";
					// 	button.style.zIndex = `${1000}`;
					// 	button.style.cursor = "pointer";
					// 	button.addEventListener("click", () => {
					// 		console.log("HERE!!", score, label);
					// 	});
					// 	div!.appendChild(button);

					// 	ctx?.beginPath();
					// 	ctx?.rect(box.left, box.top, box.width, box.height);
					// 	ctx!.lineWidth = 3;
					// 	ctx!.strokeStyle = "yellow";
					// 	ctx?.stroke();
					// });
				}}
			/>

			<div ref={div} class="relative">
				<canvas ref={cvs} />
			</div>
		</>
	);
};
