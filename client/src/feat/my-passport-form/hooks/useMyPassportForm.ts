import type { AnyDocumentId } from "@automerge/automerge-repo";
import {
	createForm,
	getValue,
	getValues,
	reset,
	type SubmitHandler,
} from "@modular-forms/solid";
import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { CoreRoute } from "core/constants/core-route.enum";
import { queryKeys as globalQueryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { toPath } from "core/router/route";
import { flattenObject, invariant } from "es-toolkit";
import { set } from "es-toolkit/compat";
import { MyPassportFormContext } from "feat/my-passport-form/context";
import { queryKeys } from "feat/my-passport-form/resources/query-keys";
import type {
	DropdownOptions,
	MyPassportForm,
	PassportApplication,
} from "feat/my-passport-form/types";
import { useRepo } from "solid-automerge";
import {
	createEffect,
	createResource,
	createSignal,
	onCleanup,
	type Resource,
} from "solid-js";

export type MaybeResource<T> = Resource<T> | T;

export const useMyPassportForm = () => {
	const repo = useRepo();
	const queryClient = useQueryClient();
	const authnContext = useContext(AuthnContext);
	const myPassportFormContext = useContext(MyPassportFormContext);

	const navigate = useNavigate();

	const [show, setShow] = createSignal({
		deleteFrictionDialog: false,
	});
	const toggleDeleteFrictionDialog = () =>
		setShow(show => ({
			...show,
			deleteFrictionDialog: !show.deleteFrictionDialog,
		}));

	const routeParams = useParams<{ uuid?: string }>();
	const [searchParams] = useSearchParams<{ automergeUrl?: string }>();

	const [form, { Form, Field, FieldArray }] = createForm<MyPassportForm>({
		validateOn: "change",
		revalidateOn: "change",
	});

	const referenceData = useQuery<DropdownOptions>(() => ({
		queryKey: queryKeys.getReferenceData(authnContext().keycloak?.token),
		queryFn: myPassportFormContext.getReferenceData,
		staleTime: Infinity,
	}));

	const referenceDataStates = useQuery<string[]>(() => ({
		queryKey: queryKeys.getReferenceDataStates(
			getValue(form, "personalDetails.countryOfBirthCode") ?? "",
			authnContext().keycloak?.token,
		),
		queryFn: () =>
			myPassportFormContext.getReferenceDataStates(
				getValue(form, "personalDetails.countryOfBirthCode") ?? "",
			),
		enabled: Boolean(getValue(form, "personalDetails.countryOfBirthCode")),
		placeholderData: [],
		staleTime: Infinity,
	}));

	const [handle] = createResource(async () => {
		if (searchParams.automergeUrl) {
			const handle = await repo.find<MyPassportForm>(
				searchParams.automergeUrl as AnyDocumentId,
			);

			await handle.whenReady();

			return handle;
		}

		const handle = repo.create<MyPassportForm>();

		await handle.whenReady();

		return handle;
	});

	const deleteForm = useMutation(() => ({
		mutationFn: myPassportFormContext.deleteApplication,
	}));

	const register = useMutation(() => ({
		mutationFn: myPassportFormContext.registerApplication,
	}));

	const submit = useMutation(() => ({
		mutationFn: (_formValues: MyPassportForm) =>
			Promise.resolve(handle()?.url),
	}));

	const onDelete = async () => {
		if (!routeParams.uuid) {
			return;
		}

		await deleteForm.mutateAsync(routeParams.uuid);
		reset(form);

		const existingApplications =
			queryClient.getQueryData<PassportApplication[]>(
				globalQueryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
			) ?? [];

		const filteredApplications = existingApplications.filter(
			application => application.uuid !== routeParams.uuid,
		);

		queryClient.setQueryData(
			globalQueryKeys.getPassportApplications(
				authnContext().keycloak?.token,
			),
			filteredApplications,
		);

		await handle()?.whenReady();
		handle()?.delete();

		navigate(toPath(CoreRoute.Home));
	};

	const onSubmit: SubmitHandler<MyPassportForm> = async (
		formValues,
		_event,
	) => {
		if (form.submitting || submit.isPending) {
			return;
		}

		await submit.mutateAsync(formValues);
		reset(form);

		navigate(toPath(CoreRoute.Home));
	};

	createEffect(() => {
		const dirtyFields = flattenObject(
			getValues(form, {
				shouldDirty: true,
			}),
		);

		if (!import.meta.env.PROD) {
			console.debug("form dirty fields", dirtyFields);
		}

		handle()?.change(doc => {
			Object.entries(dirtyFields).forEach(([path, value]) => {
				set(doc, path, value);
			});
		});
	});

	createEffect(() => {
		if (handle.loading) {
			return;
		}

		reset(form, {
			initialValues: handle()?.doc(),
		});
	});

	onCleanup(() => {
		const deleteBlankDocument = async () => {
			if (form.dirty || routeParams.uuid) {
				return;
			}

			await handle()?.whenReady();
			handle()?.delete();
		};

		deleteBlankDocument();
	});

	onCleanup(() => {
		if (!form.dirty) {
			return;
		}

		const updateExistingFormEntry = () => {
			invariant(
				handle()?.url,
				"Automerge URL for existing document is not defined, check `handle`",
			);

			const existingApplications =
				queryClient.getQueryData<PassportApplication[]>(
					globalQueryKeys.getPassportApplications(
						authnContext().keycloak?.token,
					),
				) ?? [];

			const updatedApplications = existingApplications.map(
				application => {
					if (application.uuid === routeParams.uuid) {
						return {
							...application,
							...getValues(form),
						};
					}

					return application;
				},
			);

			queryClient.setQueryData(
				globalQueryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
				updatedApplications,
			);
		};

		const registerNewForm = async () => {
			const automergeUrl = handle()?.url;

			invariant(
				automergeUrl,
				"Automerge URL is not defined, check `handle`",
			);

			const uuid = await register.mutateAsync(automergeUrl);

			const existingAutomergeUrls =
				queryClient.getQueryData<string[]>(
					globalQueryKeys.getAutomergeUrls(
						authnContext().keycloak?.token,
					),
				) ?? [];

			const updatedAutomergeUrls = [
				automergeUrl,
				...existingAutomergeUrls,
			];

			queryClient.setQueryData(
				globalQueryKeys.getAutomergeUrls(
					authnContext().keycloak?.token,
				),
				updatedAutomergeUrls,
			);

			const existingApplications =
				queryClient.getQueryData<PassportApplication[]>(
					globalQueryKeys.getPassportApplications(
						authnContext().keycloak?.token,
					),
				) ?? [];

			const updatedApplications = [
				{
					uuid,
					automergeUrl: handle()?.url,
					...getValues(form),
				},
				...existingApplications,
			];

			queryClient.setQueryData(
				globalQueryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
				updatedApplications,
			);
		};

		if (routeParams.uuid) {
			queueMicrotask(() => updateExistingFormEntry());

			return;
		}

		queueMicrotask(() => registerNewForm());
	});

	const selectReferenceData = (): DropdownOptions | null => {
		if (!referenceData.data) {
			return null;
		}

		return {
			...referenceData.data,
			stateOptions: referenceDataStates.data ?? ([] as string[]),
		};
	};

	return {
		data: {
			referenceData: selectReferenceData,
		},
		show,
		toggleDeleteFrictionDialog,
		handle,
		form,
		onSubmit,
		onDelete,
		isMutating: () => form.submitting || submit.isPending,
		Components: {
			Form,
			Field,
			FieldArray,
		},
	};
};
