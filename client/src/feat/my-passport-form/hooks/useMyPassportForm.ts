import type { AnyDocumentId, DocHandle } from "@automerge/automerge-repo";
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
import { toPath } from "core/router/utils";
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

	const qReferenceData = useQuery<DropdownOptions>(() => ({
		queryKey: queryKeys.getReferenceData(authnContext().keycloak?.token),
		queryFn: myPassportFormContext.getReferenceData,
		staleTime: Infinity,
	}));

	const qReferenceDataPersonalDetailsStates = useQuery<string[]>(() => ({
		queryKey: queryKeys.getReferenceDataStates(
			getValue(form, "personalDetails.countryOfBirthCode") ?? "",
			authnContext().keycloak?.token,
		),
		queryFn: myPassportFormContext.getReferenceDataStates,
		placeholderData: [],
		staleTime: Infinity,
	}));

	const qReferenceDataAddressDetailsStates = useQuery<string[]>(() => ({
		queryKey: queryKeys.getReferenceDataStates(
			getValue(form, "addressDetails.countryCode") ?? "",
			authnContext().keycloak?.token,
		),
		queryFn: myPassportFormContext.getReferenceDataStates,
		placeholderData: [],
		staleTime: Infinity,
	}));

	const [handle] = createResource(async () => {
		// not ideal that we are performing side effects here
		// but we don't want the page to load until we've set the initial data
		const resetFormValues = (handle: DocHandle<MyPassportForm>) => {
			if (!import.meta.env.PROD) {
				console.debug("initialValues", handle.doc());
			}

			reset(form, {
				initialValues: handle.doc(),
			});
		};

		if (searchParams.automergeUrl) {
			const handle = await repo.find<MyPassportForm>(
				searchParams.automergeUrl as AnyDocumentId,
			);

			await handle.whenReady();

			resetFormValues(handle);

			return handle;
		}

		const handle = repo.create<MyPassportForm>();

		await handle.whenReady();

		return handle;
	});

	const mDeleteForm = useMutation(() => ({
		mutationFn: myPassportFormContext.deleteApplication,
	}));

	const mRegister = useMutation(() => ({
		mutationFn: myPassportFormContext.registerApplication,
	}));

	const mSubmit = useMutation(() => ({
		mutationFn: (_formValues: MyPassportForm) =>
			Promise.resolve(handle()?.url),
	}));

	const onDelete = async () => {
		if (!routeParams.uuid) {
			return;
		}

		await mDeleteForm.mutateAsync({
			uuid: routeParams.uuid,
			sub: authnContext().keycloak?.tokenParsed?.sub,
		});
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
		if (form.submitting || mSubmit.isPending) {
			return;
		}

		await mSubmit.mutateAsync(formValues);
		reset(form);

		navigate(toPath(CoreRoute.Home));
	};

	createEffect(() => {
		if (handle.loading) {
			return;
		}

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
				if (!import.meta.env.PROD) {
					console.debug("set", path, value);
				}

				set(doc, path, value);
			});
		});
	});

	onCleanup(() => {
		invariant(form, "Form is not defined");

		const currentUuid = routeParams.uuid;
		const deleteBlankDocument = async () => {
			if (form.dirty || currentUuid) {
				return;
			}

			await handle()?.whenReady();
			handle()?.delete();
		};

		deleteBlankDocument();
	});

	onCleanup(() => {
		invariant(form, "Form is not defined");

		if (!form.dirty) {
			return;
		}

		const currentUuid = routeParams.uuid;

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
					if (application.uuid === currentUuid) {
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

			const uuid = await mRegister.mutateAsync({
				automergeUrl: automergeUrl,
				sub: authnContext().keycloak?.tokenParsed?.sub,
			});

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

		if (currentUuid) {
			queueMicrotask(() => updateExistingFormEntry());

			return;
		}

		queueMicrotask(() => registerNewForm());
	});

	const selectReferenceData = (): DropdownOptions | null => {
		if (!qReferenceData.data) {
			return null;
		}

		return {
			...qReferenceData.data,
			personalDetailsStateOptions:
				qReferenceDataPersonalDetailsStates.data ?? ([] as string[]),
			addressDetailsStateOptions:
				qReferenceDataAddressDetailsStates.data ?? ([] as string[]),
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
		isMutating: () => form.submitting || mSubmit.isPending,
		Components: {
			Form,
			Field,
			FieldArray,
		},
	};
};
