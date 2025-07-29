import { createForm } from "@modular-forms/solid";
import { yupForm } from "core/data/yup/yup-form";
import { profileSchema } from "feat/profile/spec";
import type { ProfileForm } from "feat/profile/types";

export const useProfileForm = () => {
	const [form, { Form, Field, FieldArray }] = createForm<ProfileForm>({
		validateOn: "input",
		revalidateOn: "input",
		/// @ts-expect-error - Type mismatch between Yup schema and form validation interface
		validate: yupForm(profileSchema),
	});

	return {
		form,
		Components: {
			Form,
			Field,
			FieldArray,
		},
	};
};
