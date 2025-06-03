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
import { cn } from "ui/utils";
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
import { constants } from "./ui/constants";
import { DefaultFooter, MobileFooter } from "./ui/footer";
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
						<div
							class={cn(
								constants.grid,
								// if the elements are not rendered then modular forms does
								// not keep any of the initial values
								stepStatus().currentStep ===
									Step.PersonalDetails
									? "visible"
									: "hidden",
							)}>
							<PersonalDetails
								form={form}
								Field={Components.Field}
								FieldArray={Components.FieldArray}
								dropdownOptions={data.referenceData}
							/>
						</div>

						<div
							class={cn(
								constants.grid,
								// if the elements are not rendered then modular forms does
								// not keep any of the initial values
								stepStatus().currentStep === Step.AddressDetails
									? "visible"
									: "hidden",
							)}>
							<AddressDetails
								form={form}
								Field={Components.Field}
								FieldArray={Components.FieldArray}
								dropdownOptions={data.referenceData}
							/>
						</div>

						<div
							class={cn(
								constants.grid,
								// if the elements are not rendered then modular forms does
								// not keep any of the initial values
								stepStatus().currentStep ===
									Step.ApplicationDetails
									? "visible"
									: "hidden",
							)}>
							<ApplicationDetails
								form={form}
								Field={Components.Field}
								FieldArray={Components.FieldArray}
								dropdownOptions={data.referenceData}
							/>
						</div>

						<div
							class={cn(
								constants.grid,
								// if the elements are not rendered then modular forms does
								// not keep any of the initial values
								stepStatus().currentStep ===
									Step.PreviousDocuments
									? "visible"
									: "hidden",
							)}>
							<PreviousDocuments />
						</div>

						<div
							class={cn(
								constants.grid,
								// if the elements are not rendered then modular forms does
								// not keep any of the initial values
								stepStatus().currentStep === Step.Declaration
									? "visible"
									: "hidden",
							)}>
							<Declaration />
						</div>
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
