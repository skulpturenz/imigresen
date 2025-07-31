import { createForm, reset, type SubmitHandler } from "@modular-forms/solid";
import { useMutation } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { yupForm } from "core/data/yup/yup-form";
import { ProfileContext } from "feat/profile/context";
import { profileSchema } from "feat/profile/spec";
import type { ProfileForm, UpdateProfilePayload } from "feat/profile/types";
import { createEffect } from "solid-js";

export const useProfileForm = () => {
	const profileContext = useContext(ProfileContext);
	const userContext = useContext(UserContext);
	const authnContext = useContext(AuthnContext);

	const [form, { Form, Field, FieldArray }] = createForm<ProfileForm>({
		validateOn: "input",
		revalidateOn: "input",
		/// @ts-expect-error - Type mismatch between Yup schema and form validation interface
		validate: yupForm(profileSchema),
	});

	const mUpdateProfile = useMutation(() => ({
		mutationFn: ({ values, uuid }: UpdateProfilePayload) =>
			profileContext.updateProfile(values, uuid),
		onSuccess: async () => {
			const token = authnContext().keycloak?.token;
			const profile = authnContext().profile;
			
			// Refresh user profile data after successful update
			if (token && profile?.email) {
				await userContext().actions.refreshProfile(token, profile.email);
			}
		},
	}));

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

	const submitHandler: SubmitHandler<ProfileForm> = async values => {
		const profile = userContext().profile;

		await mUpdateProfile.mutateAsync({
			values: values.userDetails,
			uuid: profile?.uuid ?? "",
		});
	};

	return {
		form,
		submitHandler,
		isMutating: () => form.submitting || mUpdateProfile.isPending,
		Components: {
			Form,
			Field,
			FieldArray,
		},
	};
};
