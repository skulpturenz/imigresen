import { createForm, reset, type SubmitHandler } from "@modular-forms/solid";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { queryKeys as globalQueryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { yupForm } from "core/data/yup/yup-form";
import { ProfileContext } from "feat/profile/context";
import { profileSchema } from "feat/profile/spec";
import type { ProfileForm, UpdateProfilePayload } from "feat/profile/types";
import { onMount } from "solid-js";

export const useProfileForm = () => {
	const profileContext = useContext(ProfileContext);
	const userContext = useContext(UserContext);
	const queryClient = useQueryClient();
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
			queryClient.invalidateQueries({
				queryKey: globalQueryKeys.getUserDetails(
					authnContext().keycloak?.token,
				),
			});

			queryClient.invalidateQueries({
				queryKey: globalQueryKeys.getPersonalDetails(
					authnContext().keycloak?.token,
				),
			});
		},
	}));

	// Set default values when user profile is available
	onMount(() => {
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
