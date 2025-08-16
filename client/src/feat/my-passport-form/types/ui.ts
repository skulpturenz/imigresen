import type { createForm, FormStore } from "@modular-forms/solid";
import type { MyPassportForm } from "common/epic/my-passport-form/types";
import type { Accessor } from "solid-js";

export enum Step {
	PersonalDetails = 1,
	AddressDetails,
	ApplicationDetails,
	PreviousDocuments,
	Declaration,
}

export interface DropdownOptions {
	genderOptions: Record<string, string>;
	relationshipStatusOptions: Record<string, string>;
	countryOptions: Record<string, string>;
	personalDetailsStateOptions: string[];
	addressDetailsStateOptions: string[];
	requestTypeOptions: Record<string, string>;
	documentTypeOptions: Record<string, string>;
}

export interface Option<T = number | string, U = string> {
	key: T;
	label: U;
}

// TODO
export interface StepProps {
	form: FormStore<MyPassportForm>;
	dropdownOptions: Accessor<DropdownOptions | null>;
	Field: ReturnType<typeof createForm<MyPassportForm>>[1]["Field"];
	FieldArray: ReturnType<typeof createForm<MyPassportForm>>[1]["FieldArray"];
}
