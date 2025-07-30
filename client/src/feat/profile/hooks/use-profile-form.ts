import { createForm, reset, type SubmitHandler } from "@modular-forms/solid";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { yupForm } from "core/data/yup/yup-form";
import { ProfileContext } from "feat/profile/context";
import { profileSchema } from "feat/profile/spec";
import type { ProfileForm } from "feat/profile/types";
import { createEffect } from "solid-js";

export const useProfileForm = () => {
	const profileContext = useContext(ProfileContext);
	const userContext = useContext(UserContext);

	const [form, { Form, Field, FieldArray }] = createForm<ProfileForm>({
		validateOn: "input",
		revalidateOn: "input",
		/// @ts-expect-error - Type mismatch between Yup schema and form validation interface
		validate: yupForm(profileSchema),
	});

	// Set default values when user profile is available
	createEffect(() => {
		const profile = userContext().profile;
		if (profile) {
			reset(form, {
				initialValues: {
					userDetails: {
						firstName: profile.firstName,
						lastName: profile.lastName,
						email: profile.email,
					},
				},
			});
		}
	});

	const submitHandler: SubmitHandler<ProfileForm> = async (values) => {
		const profile = userContext().profile;

		await profileContext.updateProfile(values, profile.uuid);
	};

	return {
		form,
		submitHandler,
		Components: {
			Form,
			Field,
			FieldArray,
		},
	};
};
