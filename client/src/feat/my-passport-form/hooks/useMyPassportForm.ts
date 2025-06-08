import type { AnyDocumentId, Doc } from "@automerge/automerge-repo";
import {
	createForm,
	getValue,
	getValues,
	reset,
	type SubmitHandler,
} from "@modular-forms/solid";
import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { selectMyPassportForm } from "common/epic/my-passport-form/select/selectMyPassportForm";
import { MyPassportFormVersionLatest } from "common/epic/my-passport-form/types/MyPassportFormVersion.enum";
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
		const resetFormValues = (doc: Doc<MyPassportForm>) => {
			if (!import.meta.env.PROD) {
				console.debug("initialValues", doc);
			}

			reset(form, {
				initialValues: doc,
			});
		};

		if (searchParams.automergeUrl) {
			const handle = await repo.find<MyPassportForm>(
				searchParams.automergeUrl as AnyDocumentId,
			);

			await handle.whenReady();

			const doc = selectMyPassportForm(handle.doc());

			resetFormValues(doc);

			return handle;
		}

		const handle = repo.create<Partial<MyPassportForm>>({
			version: MyPassportFormVersionLatest,
		});

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

		queryClient.refetchQueries({
			queryKey: globalQueryKeys.getPassportApplications(
				authnContext().keycloak?.token,
			),
		});

		await handle()?.whenReady();
		repo.delete(handle()?.documentId as AnyDocumentId);

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

			queryClient.refetchQueries({
				queryKey: globalQueryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
			});
		};

		const registerNewForm = async () => {
			const automergeUrl = handle()?.url;

			invariant(
				automergeUrl,
				"Automerge URL is not defined, check `handle`",
			);

			await mRegister.mutateAsync({
				automergeUrl: automergeUrl,
				sub: authnContext().keycloak?.tokenParsed?.sub,
			});

			queryClient.refetchQueries({
				queryKey: globalQueryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
			});
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
