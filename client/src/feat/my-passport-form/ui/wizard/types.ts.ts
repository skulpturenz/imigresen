import type { Step } from "feat/my-passport-form/types";
import type { StepStatus } from "ui/stepper/types";

export interface WizardStep {
	key: Step;
	hash: string;
	status: StepStatus;
	label: string;
	description: string;
}
