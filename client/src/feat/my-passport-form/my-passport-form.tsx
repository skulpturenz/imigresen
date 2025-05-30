import { Form } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import { Show, Suspense } from "solid-js";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "ui/alert-dialog";
import { useMyPassportForm } from "./hooks/useMyPassportForm";
import { useWizardSteps } from "./hooks/useWizardSteps";
import type { resources } from "./resources/i18n/en-US";
import {
	AddressDetails,
	ApplicationDetails,
	Declaration,
	PersonalDetails,
	PreviousDocuments,
} from "./steps";
import { Step } from "./types";
import { DefaultFooter, MobileFooter } from "./ui/footer";
import { Wizard } from "./ui/wizard";

export const MyPassportForm = () => {
	const {
		show,
		handle: _handle,
		form,
		isMutating,
		onSubmit,
		onDelete,
		Components,
		toggleDeleteFrictionDialog,
	} = useMyPassportForm();

	const t = useI18n<typeof resources>();

	const { stepStatus, steps, nextStep, previousStep } = useWizardSteps();

	const onClickNext = nextStep;
	const onClickBack = previousStep;
	const onClickDelete = toggleDeleteFrictionDialog;

	return (
		<>
			<Wizard
				steps={steps()}
				Footer={
					<>
						<DefaultFooter
							onClickNext={onClickNext}
							onClickBack={onClickBack}
							onClickDelete={onClickDelete}
							isMutating={isMutating}
						/>

						<MobileFooter
							onClickNext={onClickNext}
							onClickBack={onClickBack}
							onClickDelete={onClickDelete}
							isMutating={isMutating}
						/>
					</>
				}>
				<Form
					of={form}
					onSubmit={onSubmit}
					class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
					<Suspense fallback={<div>{t("loading")}</div>}>
						<Show
							when={
								stepStatus().currentStep ===
								Step.PersonalDetails
							}>
							<PersonalDetails
								form={form}
								Field={Components.Field}
								FieldArray={Components.FieldArray}
							/>
						</Show>

						<Show
							when={
								stepStatus().currentStep === Step.AddressDetails
							}>
							<AddressDetails />
						</Show>

						<Show
							when={
								stepStatus().currentStep ===
								Step.ApplicationDetails
							}>
							<ApplicationDetails />
						</Show>

						<Show
							when={
								stepStatus().currentStep ===
								Step.PreviousDocuments
							}>
							<PreviousDocuments />
						</Show>

						<Show
							when={
								stepStatus().currentStep === Step.Declaration
							}>
							<Declaration />
						</Show>
					</Suspense>
				</Form>
			</Wizard>

			<AlertDialog open={show().deleteFrictionDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you absolutely sure?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently
							delete your account and remove your data from our
							servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogClose onClick={toggleDeleteFrictionDialog}>
							Cancel
						</AlertDialogClose>
						<AlertDialogAction onClick={onDelete}>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
