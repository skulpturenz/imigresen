import { useLocation, useNavigate, type Location } from "@solidjs/router";
import { useI18n } from "core/context/i18n/provider";
import { kebabCase, pascalCase } from "es-toolkit";
import type { resources } from "feat/my-passport-form/resources/i18n/en-us";
import { Step } from "feat/my-passport-form/types/ui";
import type { WizardStep } from "feat/my-passport-form/ui/wizard/types";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { StepStatus } from "ui/stepper/types";

export const useWizardSteps = () => {
	const t = useI18n<typeof resources>();

	const FIRST_STEP = Step.PersonalDetails;
	const LAST_STEP = Step.Declaration;

	const STEPS = [
		{
			key: Step.PersonalDetails,
			hash: toHash(Step.PersonalDetails),
			label: t("steps.1.label"),
			description: t("steps.1.description"),
		},
		{
			key: Step.AddressDetails,
			hash: toHash(Step.AddressDetails),
			label: t("steps.2.label"),
			description: t("steps.2.description"),
		},
		{
			key: Step.ApplicationDetails,
			hash: toHash(Step.ApplicationDetails),
			label: t("steps.3.label"),
			description: t("steps.3.description"),
		},
		{
			key: Step.PreviousDocuments,
			hash: toHash(Step.PreviousDocuments),
			label: t("steps.4.label"),
			description: t("steps.4.description"),
		},
		{
			key: Step.Declaration,
			hash: toHash(Step.Declaration),
			label: t("steps.5.label"),
			description: t("steps.5.description"),
		},
	] satisfies Partial<WizardStep>[];

	const location = useLocation();
	const navigate = useNavigate();
	const [stepStatus, setStepStatus] = createSignal<any>({
		currentStep: toStep(location.hash.replace("#", "")) ?? FIRST_STEP,
	});

	onMount(() => {
		if (location.hash) {
			return;
		}

		navigate(
			[location.search, toHash(stepStatus().currentStep)]
				.filter(Boolean)
				.join(""),
		);
	});

	onCleanup(() => {
		window.history.pushState("", document.title, window.location.pathname);
	});

	createEffect(() => {
		const locationStep = toStep(location.hash.replace("#", ""));

		if (locationStep === stepStatus().currentStep || !locationStep) {
			return;
		}

		setStep(locationStep);
	});

	const steps = () => {
		const getStepStatus = (step: Step) => {
			if (stepStatus().currentStep === step) {
				return StepStatus.Current;
			}

			if (stepStatus()[step]) {
				return stepStatus()[step];
			}

			if (step > stepStatus().currentStep) {
				return StepStatus.Upcoming;
			}

			return StepStatus.Previous;
		};

		return STEPS.map(step => ({
			...step,
			status: getStepStatus(step.key),
		}));
	};

	const setStep = (step: Step) =>
		setStepStatus(stepStatus => ({
			...stepStatus,
			currentStep: Math.max(Math.min(step, LAST_STEP), FIRST_STEP),
		}));

	const nextStep = () =>
		navigate(
			[
				location.search,
				toHash(Math.min(stepStatus().currentStep + 1, LAST_STEP)),
			]
				.filter(Boolean)
				.join(""),
		);

	const previousStep = () => {
		if (stepStatus().currentStep === FIRST_STEP) {
			navigate("/");

			return;
		}

		navigate(
			[
				location.search,
				toHash(Math.max(stepStatus().currentStep - 1, FIRST_STEP)),
			]
				.filter(Boolean)
				.join(""),
		);
	};

	return {
		steps,
		stepStatus,
		nextStep,
		previousStep,
	};
};

export const toHash = (step: Step) => `#${kebabCase(Step[step])}`;

export const toStep = (key: string) =>
	Step[pascalCase(key) as keyof typeof Step] || null;

export const isCurrentStep = (location: Location, step: Step) =>
	toStep(location.hash.replace("#", "")) === step;
