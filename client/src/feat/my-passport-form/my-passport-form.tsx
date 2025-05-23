import { Form } from "@modular-forms/solid";
import { useI18n } from "core/context/i18n";
import { lazy, Show, Suspense } from "solid-js";
import { useMyPassportForm } from "./hooks/useMyPassportForm.ts";
import { useWizardSteps } from "./hooks/useWizardSteps.ts";
import type { resources } from "./resources/i18n/en-US";
import { Step } from "./types";
import { DefaultFooter, MobileFooter } from "./ui/footer";
import { Wizard } from "./ui/wizard";

export const MyPassportForm = () => {
	const {
		handle: _handle,
		form,
		isMutating,
		onSubmit,
		onDelete,
		Components,
	} = useMyPassportForm();

	const t = useI18n<typeof resources>();

	const { stepStatus, steps, nextStep, previousStep } = useWizardSteps();

	const onClickNext = nextStep;
	const onClickBack = previousStep;
	const onClickDelete = onDelete;

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
					class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
		</>
	);
};

const AddressDetails = lazy(() =>
	import("./steps/address-details").then(({ AddressDetails }) => ({
		default: AddressDetails,
	})),
);

const ApplicationDetails = lazy(() =>
	import("./steps/application-details").then(({ ApplicationDetails }) => ({
		default: ApplicationDetails,
	})),
);

const Declaration = lazy(() =>
	import("./steps/declaration").then(({ Declaration }) => ({
		default: Declaration,
	})),
);

const PersonalDetails = lazy(() =>
	import("./steps/personal-details").then(({ PersonalDetails }) => ({
		default: PersonalDetails,
	})),
);

const PreviousDocuments = lazy(() =>
	import("./steps/previous-documents").then(({ PreviousDocuments }) => ({
		default: PreviousDocuments,
	})),
);
