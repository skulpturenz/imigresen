import type { StepStatus } from "ui/stepper/types";

export interface WizardStep {
	hash: string;
	status: StepStatus;
	label: string;
	description: string;
}

export enum Step {
	ApplicationDetails = 1,
	PersonalDetails,
	AddressDetails,
	PreviousDocuments,
	Declaration,
}
