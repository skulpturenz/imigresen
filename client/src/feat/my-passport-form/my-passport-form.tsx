import { useI18n } from "core/context/i18n";
import { Check, LoaderCircle } from "lucide-solid";
import { createSignal, lazy, Show, Suspense } from "solid-js";
import { Badge } from "ui/badge";
import { useWizardSteps } from "./hooks/useWizardSteps.ts";
import type { resources } from "./resources/i18n/en-US";
import { Step } from "./types.ts";
import { DefaultFooter, MobileFooter } from "./ui/footer";
import { Wizard } from "./ui/wizard";

export const MyPassportForm = () => {
	// TODO
	const [peristStatus, _setPersistStatus] = createSignal<
		"persisted" | "persisting" | null
	>("persisting");

	const t = useI18n<typeof resources>();

	const { stepStatus, steps, nextStep, previousStep } = useWizardSteps();

	const onClickNext = nextStep;
	const onClickBack = previousStep;

	return (
		<>
			<Show when={peristStatus()}>
				<div class="flex flex-col mb-4">
					<Show when={peristStatus() === "persisted"}>
						<Badge
							variant="outline"
							class="self-end items-center flex gap-2">
							<Check class="size-4" />
							{t("isPersisted")}
						</Badge>
					</Show>

					<Show when={peristStatus() === "persisting"}>
						<Badge class="self-end flex gap-2 items-center">
							<LoaderCircle
								// TODO: the icon is not centred
								class="size-4 animate-spin"
							/>
							{t("isPersisting")}
						</Badge>
					</Show>
				</div>
			</Show>

			<Wizard
				steps={steps()}
				Footer={
					<>
						<DefaultFooter
							onClickNext={onClickNext}
							onClickBack={onClickBack}
						/>

						<MobileFooter
							onClickNext={onClickNext}
							onClickBack={onClickBack}
						/>
					</>
				}>
				<form>
					<Suspense
						// TODO
						fallback={<div>Loading...</div>}>
						<Show
							when={
								stepStatus().currentStep ===
								Step.PersonalDetails
							}>
							<PersonalDetails />
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
				</form>
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
