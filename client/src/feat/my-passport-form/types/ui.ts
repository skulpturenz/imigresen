import type { createForm, FormStore } from "@modular-forms/solid";
import type { MyPassportForm } from "./api";

export enum Step {
	PersonalDetails = 1,
	AddressDetails,
	ApplicationDetails,
	PreviousDocuments,
	Declaration,
}

// TODO
export interface StepProps {
	form: FormStore<any>;
	Field: ReturnType<typeof createForm<MyPassportForm>>[1]["Field"];
	FieldArray: ReturnType<typeof createForm<MyPassportForm>>[1]["FieldArray"];
}
