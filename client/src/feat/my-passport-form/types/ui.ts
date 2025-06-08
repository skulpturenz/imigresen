import type { createForm, FormStore } from "@modular-forms/solid";
import type { MyPassportForm } from "common/types/epic/my-passport-form";
import type { Accessor } from "solid-js";
import type { DropdownOptions } from "./api";

export enum Step {
	PersonalDetails = 1,
	AddressDetails,
	ApplicationDetails,
	PreviousDocuments,
	Declaration,
}

// TODO
export interface StepProps {
	form: FormStore<MyPassportForm>;
	dropdownOptions: Accessor<DropdownOptions | null>;
	Field: ReturnType<typeof createForm<MyPassportForm>>[1]["Field"];
	FieldArray: ReturnType<typeof createForm<MyPassportForm>>[1]["FieldArray"];
}
