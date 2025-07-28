import { createForm } from "@modular-forms/solid";
import type { ProfileForm } from "feat/profile/types";
import { yupForm } from "src/core/data/yup";
import { userDetailsSchema } from "feat/profile/spec";

export const useProfileForm = () => {
	const [form, { Form, Field, FieldArray }] = createForm<ProfileForm>({
		validateOn: "change",
		revalidateOn: "change",
		validate: yupForm(userDetailsSchema),
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
