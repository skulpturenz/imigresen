import { useI18n } from "core/context/i18n";
import { kebabCase } from "es-toolkit";
import { Check, LoaderCircle } from "lucide-solid";
import { createSignal, lazy, Show } from "solid-js";
import { Badge } from "ui/badge";
import { StepStatus } from "ui/stepper/types.ts";
import type { resources } from "./resources/i18n/en-US";
import { DefaultFooter, MobileFooter } from "./ui/footer";
import { Wizard } from "./ui/wizard";
import { Step, type WizardStep } from "./ui/wizard/types.ts";

export const MyPassportForm = () => {
	// TODO
	const [peristStatus, _setPersistStatus] = createSignal<
		"persisted" | "persisting" | null
	>("persisting");

	const t = useI18n<typeof resources>();

	const toHash = (step: Step) => `#${kebabCase(Step[step])}`;

	const steps: WizardStep[] = [
		{
			hash: toHash(Step.ApplicationDetails),
			status: StepStatus.Complete,
			label: "Step 1",
			description: "Application details",
		},
		{
			hash: toHash(Step.PersonalDetails),
			status: StepStatus.Current,
			label: "Step 2",
			description: "Personal details",
		},
		{
			hash: toHash(Step.AddressDetails),
			status: StepStatus.Upcoming,
			label: "Step 3",
			description: "Address details",
		},
		{
			hash: toHash(Step.PreviousDocuments),
			status: StepStatus.Upcoming,
			label: "Step 4",
			description: "Previous document",
		},
		{
			hash: toHash(Step.Declaration),
			status: StepStatus.Upcoming,
			label: "Step 5",
			description: "Declaration",
		},
	];

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
				steps={steps}
				Footer={
					<>
						<DefaultFooter />

						<MobileFooter />
					</>
				}>
				<form>
					<ApplicationDetails />

					<PersonalDetails />

					<AddressDetails />

					<Declaration />

					<PreviousDocuments />
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
