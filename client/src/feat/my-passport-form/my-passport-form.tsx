import { Form } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import { Check } from "lucide-solid";
import { Match, Suspense, Switch, type Component } from "solid-js";
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
import { Badge } from "ui/badge";
import { Button } from "ui/button";
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

interface MyPassportFormProps {
	ref?: any;
}

export const MyPassportForm: Component<MyPassportFormProps> = props => {
	const { stepStatus, steps, nextStep, previousStep } = useWizardSteps();

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
		toggleInvalidDataDialog,
		prefillData,
		registerNewForm,
		isAutosaving,
	} = useMyPassportForm({ stepStatus });

	props.ref?.({
		registerApplication: () => {
			registerNewForm();
		},
	});

	const t = useI18n<typeof resources>();

	const onClickNext = nextStep;
	const onClickBack = previousStep;
	const onClickDelete = toggleDeleteFrictionDialog;

	return (
		<>
			{import.meta.env.DEV && (
				<div
					// TODO: REMOVE
					class="flex space-x-2 w-full justify-end my-4">
					<Button onClick={prefillData}>Prefill data</Button>
					<Badge variant="outline" class="flex gap-2 items-center">
						<Switch>
							<Match when={isAutosaving()}>
								<svg
									class="size-4 animate-spin text-foreground"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								{t("saving")}
							</Match>

							<Match when={!isAutosaving()}>
								<Check class="text-foreground size-4" />

								{t("autosaved")}
							</Match>
						</Switch>
					</Badge>
				</div>
			)}

			<Form of={form} onSubmit={onSubmit}>
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
							<Declaration
								form={form}
								Field={Components.Field}
								FieldArray={Components.FieldArray}
								dropdownOptions={data.referenceData}
							/>
						</Hide>
					</Suspense>
				</Wizard>
			</Form>

			<AlertDialog open={show().invalidDataDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("invalidDataDialog.title")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("invalidDataDialog.description")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogClose onClick={toggleInvalidDataDialog}>
							{t("invalidDataDialog.doOk")}
						</AlertDialogClose>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

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
