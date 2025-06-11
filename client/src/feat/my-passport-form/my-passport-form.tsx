import { Form } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import { Suspense } from "solid-js";
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
import { useMyPassportForm } from "./hooks/use-my-passport-form";
import { useWizardSteps } from "./hooks/use-wizard-steps";
import type { resources } from "./resources/i18n/en-us";
import {
	AddressDetails,
	ApplicationDetails,
	Declaration,
	PersonalDetails,
	PreviousDocuments,
} from "./steps";
import { Step } from "./types";
import { constants } from "./ui/constants";
import { DefaultFooter, MobileFooter } from "./ui/footer";
import { Hide } from "./ui/hide";
import { Wizard } from "./ui/wizard";

export const MyPassportForm = () => {
	const {
		show,
		data,
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
				<Form of={form} onSubmit={onSubmit}>
					<Suspense fallback={<div>{t("loading")}</div>}>
						<Hide
							when={
								stepStatus().currentStep !==
								Step.PersonalDetails
							}
							class={constants.grid}>
							<PersonalDetails
								form={form}
								Field={Components.Field}
								FieldArray={Components.FieldArray}
								dropdownOptions={data.referenceData}
							/>
						</Hide>

						<Hide
							when={
								stepStatus().currentStep !== Step.AddressDetails
							}
							class={constants.grid}>
							<AddressDetails
								form={form}
								Field={Components.Field}
								FieldArray={Components.FieldArray}
								dropdownOptions={data.referenceData}
							/>
						</Hide>

						<Hide
							when={
								stepStatus().currentStep !==
								Step.ApplicationDetails
							}
							class={constants.grid}>
							<ApplicationDetails
								form={form}
								Field={Components.Field}
								FieldArray={Components.FieldArray}
								dropdownOptions={data.referenceData}
							/>
						</Hide>

						<Hide
							when={
								stepStatus().currentStep !==
								Step.PreviousDocuments
							}
							class={constants.grid}>
							<PreviousDocuments
								form={form}
								Field={Components.Field}
								FieldArray={Components.FieldArray}
								dropdownOptions={data.referenceData}
							/>
						</Hide>

						<Hide
							when={stepStatus().currentStep !== Step.Declaration}
							class={constants.grid}>
							<Declaration />
						</Hide>
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
