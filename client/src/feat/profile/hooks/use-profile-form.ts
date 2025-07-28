import { createForm } from "@modular-forms/solid";
import type { ProfileForm } from "feat/profile/types";
import { yupForm } from "src/core/data/yup";
import { profileSchema } from "feat/profile/spec";

export const useProfileForm = () => {
	const [form, { Form, Field, FieldArray }] = createForm<ProfileForm>({
		validateOn: "change",
		revalidateOn: "change",
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
