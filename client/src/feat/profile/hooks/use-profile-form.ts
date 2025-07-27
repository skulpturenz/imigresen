import { createForm } from "@modular-forms/solid";
import type { ProfileForm } from "feat/profile/types";

export const useProfileForm = () => {
	const [form, { Form, Field, FieldArray }] = createForm<ProfileForm>({
		validateOn: "change",
		revalidateOn: "change",
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